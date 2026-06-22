import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { AuditLog, Message, Notification, Task, Meeting, Project, Transcript, User } from "./models.js";

type SocketUser = { userId: string; workspaceId: string; name: string; role: string };

let _io: Server | null = null;
export const getIO = () => _io;

export function emitToWorkspace(workspaceId: string, event: string, payload: unknown) {
  _io?.to(`workspace:${workspaceId}`).emit(event, payload);
}

export function emitToMeeting(meetingId: string, event: string, payload: unknown) {
  _io?.to(`meeting:${meetingId}`).emit(event, payload);
}

export async function createAuditLog(opts: {
  workspaceId?: string; actorUserId?: string; eventType: string;
  severity?: "info" | "warn" | "error"; resourceType?: string; resourceId?: string;
  before?: unknown; after?: unknown; ip?: string; device?: string;
}) {
  try {
    await AuditLog.create({
      workspaceId: opts.workspaceId,
      actorUserId: opts.actorUserId,
      eventType: opts.eventType,
      severity: opts.severity ?? "info",
      resourceType: opts.resourceType,
      resourceId: String(opts.resourceId ?? ""),
      metadata: { before: opts.before ?? null, after: opts.after ?? null, ip: opts.ip, device: opts.device },
    });
  } catch { /* never throw from audit */ }
}

function startChangeStreams(io: Server) {
  const watch = (model: mongoose.Model<any>, handler: (doc: any, op: string) => void) => {
    try {
      const stream = model.watch([], { fullDocument: "updateLookup" });
      stream.on("change", (c) => handler(c.fullDocument ?? c.documentKey, c.operationType));
      stream.on("error", () => { /* replica set required — skip in standalone */ });
    } catch { /* standalone mongo — skip */ }
  };

  watch(Meeting, (doc, op) => {
    if (!doc?.workspaceId) return;
    const ev = op === "insert" ? "meeting:created" : op === "delete" ? "meeting:deleted" : "meeting:updated";
    io.to(`workspace:${doc.workspaceId}`).emit(ev, doc);
  });

  watch(Task, (doc, op) => {
    if (!doc?.workspaceId) return;
    const ev = op === "insert" ? "task:created" : op === "delete" ? "task:deleted" : "task:updated";
    io.to(`workspace:${doc.workspaceId}`).emit(ev, doc);
    if (op !== "delete" && doc.status === "done") io.to(`workspace:${doc.workspaceId}`).emit("task:completed", doc);
  });

  watch(Notification, (doc, op) => {
    if (!doc?.workspaceId) return;
    const ev = op === "insert" ? "notification:created" : op === "delete" ? "notification:deleted" : "notification:updated";
    io.to(`workspace:${doc.workspaceId}`).emit(ev, doc);
  });

  watch(Project, (doc, op) => {
    if (!doc?.workspaceId) return;
    const ev = op === "insert" ? "project:created" : op === "delete" ? "project:deleted" : "project:updated";
    io.to(`workspace:${doc.workspaceId}`).emit(ev, doc);
  });

  watch(Transcript, (doc) => {
    if (!doc?.meetingId) return;
    io.to(`meeting:${doc.meetingId}`).emit("transcript:created", doc);
    if (doc?.workspaceId) io.to(`workspace:${doc.workspaceId}`).emit("ai:transcript_updated", { meetingId: String(doc.meetingId) });
  });

  watch(User, (doc) => {
    if (!doc?.workspaceId) return;
    io.to(`workspace:${doc.workspaceId}`).emit("presence:changed", { userId: String(doc._id), online: doc.online, name: doc.name });
  });
}

function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token ?? String(socket.handshake.headers?.authorization ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return next(new Error("Missing token"));
  try {
    const p = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
    if (!p.sub || !p.workspaceId) return next(new Error("Invalid token payload"));
    socket.data.user = { userId: String(p.sub), workspaceId: String(p.workspaceId), name: String(p.name ?? ""), role: String(p.role ?? "member") } satisfies SocketUser;
    return next();
  } catch {
    return next(new Error("Invalid token"));
  }
}

export function createRealtimeServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) ? cb(null, true) : cb(new Error("CORS")),
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  _io = io;
  io.use(authMiddleware);
  startChangeStreams(io);

  const socketToUser = new Map<string, string>();

  io.on("connection", async (socket) => {
    const user = socket.data.user as SocketUser;
    const wsRoom = `workspace:${user.workspaceId}`;
    socketToUser.set(socket.id, user.userId);
    socket.join(wsRoom);
    await User.findByIdAndUpdate(user.userId, { online: true }).catch(() => undefined);
    io.to(wsRoom).emit("presence:changed", { userId: user.userId, online: true, name: user.name });

    // ── Meeting ───────────────────────────────────────────────────────────────
    socket.on("meeting:join", async ({ roomId }: { roomId: string }) => {
      socket.join(`meeting:${roomId}`);
      socket.to(`meeting:${roomId}`).emit("meeting:peer-joined", { peerId: socket.id, userId: user.userId, name: user.name });
      const room = io.sockets.adapter.rooms.get(`meeting:${roomId}`);
      const peers = room ? Array.from(room).filter((s) => s !== socket.id) : [];
      socket.emit("meeting:existing-peers", peers.map((s) => ({ peerId: s, userId: socketToUser.get(s) ?? s })));
      await createAuditLog({ workspaceId: user.workspaceId, actorUserId: user.userId, eventType: "meeting.joined", resourceType: "meeting", resourceId: roomId });
    });

    socket.on("meeting:leave", async ({ roomId }: { roomId: string }) => {
      socket.leave(`meeting:${roomId}`);
      socket.to(`meeting:${roomId}`).emit("meeting:peer-left", { peerId: socket.id, userId: user.userId });
      await createAuditLog({ workspaceId: user.workspaceId, actorUserId: user.userId, eventType: "meeting.left", resourceType: "meeting", resourceId: roomId });
    });

    // ── WebRTC ────────────────────────────────────────────────────────────────
    socket.on("webrtc:offer", ({ to, offer }) => io.to(to).emit("webrtc:offer", { from: socket.id, userId: user.userId, offer }));
    socket.on("webrtc:answer", ({ to, answer }) => io.to(to).emit("webrtc:answer", { from: socket.id, userId: user.userId, answer }));
    socket.on("webrtc:ice-candidate", ({ to, candidate }) => io.to(to).emit("webrtc:ice-candidate", { from: socket.id, userId: user.userId, candidate }));

    // ── Meeting controls ──────────────────────────────────────────────────────
    socket.on("meeting:control", async ({ roomId, control, value }: { roomId: string; control: string; value: unknown }) => {
      socket.to(`meeting:${roomId}`).emit("meeting:control", { userId: user.userId, control, value });
      if (control === "recording") {
        await createAuditLog({ workspaceId: user.workspaceId, actorUserId: user.userId, eventType: value ? "meeting.recording.started" : "meeting.recording.stopped", resourceType: "meeting", resourceId: roomId });
      }
    });

    socket.on("meeting:reaction", ({ roomId, emoji }) => {
      io.to(`meeting:${roomId}`).emit("meeting:reaction", { userId: user.userId, name: user.name, emoji });
    });

    // ── Chat ──────────────────────────────────────────────────────────────────
    socket.on("chat:message", async ({ roomId, text }: { roomId: string; text: string }) => {
      if (!text?.trim()) return;
      const msg = await Message.create({ workspaceId: user.workspaceId, roomId, userId: user.userId, text: text.trim() }).catch(() => null);
      if (msg) io.to(`meeting:${roomId}`).emit("chat:message", { _id: String(msg._id), userId: user.userId, name: user.name, text: msg.text, createdAt: msg.createdAt });
    });

    socket.on("chat:edit", async ({ messageId, text }) => {
      const msg = await Message.findOneAndUpdate({ _id: messageId, userId: user.userId }, { text }, { new: true }).catch(() => null);
      if (msg) io.to(`meeting:${msg.roomId}`).emit("chat:edited", { messageId, text });
    });

    socket.on("chat:delete", async ({ messageId }) => {
      const msg = await Message.findOneAndDelete({ _id: messageId, userId: user.userId }).catch(() => null);
      if (msg) io.to(`meeting:${msg.roomId}`).emit("chat:deleted", { messageId });
    });

    socket.on("typing:start", ({ roomId }) => socket.to(`meeting:${roomId}`).emit("typing:start", { userId: user.userId, name: user.name }));
    socket.on("typing:stop", ({ roomId }) => socket.to(`meeting:${roomId}`).emit("typing:stop", { userId: user.userId }));

    // ── Transcript ────────────────────────────────────────────────────────────
    socket.on("transcript:delta", async ({ meetingId, speaker, text, atSeconds }) => {
      if (!text?.trim()) return;
      const t = await Transcript.create({ workspaceId: user.workspaceId, meetingId, speaker: speaker || user.name, text: text.trim(), atSeconds: atSeconds ?? 0 }).catch(() => null);
      if (t) io.to(`meeting:${meetingId}`).emit("transcript:created", t);
    });

    socket.on("transcript:finished", ({ meetingId }) => io.to(`meeting:${meetingId}`).emit("transcript:updated", { meetingId }));

    // ── Tasks ─────────────────────────────────────────────────────────────────
    socket.on("task:update", async ({ taskId, patch }) => {
      const before = await Task.findById(taskId).lean().catch(() => null);
      const task = await Task.findOneAndUpdate({ _id: taskId, workspaceId: user.workspaceId }, patch, { new: true }).catch(() => null);
      if (task) {
        io.to(wsRoom).emit("task:updated", task);
        if (task.status === "done") io.to(wsRoom).emit("task:completed", task);
        await createAuditLog({ workspaceId: user.workspaceId, actorUserId: user.userId, eventType: "task.updated", resourceType: "task", resourceId: taskId, before, after: task });
      }
    });

    // ── Notifications ─────────────────────────────────────────────────────────
    socket.on("notification:create", async (payload) => {
      const n = await Notification.create({ ...payload, workspaceId: user.workspaceId }).catch(() => null);
      if (n) io.to(wsRoom).emit("notification:created", n);
    });

    socket.on("notification:read", async ({ notificationId }) => {
      await Notification.findByIdAndUpdate(notificationId, { read: true }).catch(() => undefined);
      socket.emit("notification:updated", { notificationId, read: true });
    });

    socket.on("notification:read-all", async () => {
      await Notification.updateMany({ userId: user.userId, workspaceId: user.workspaceId }, { read: true }).catch(() => undefined);
      socket.emit("notification:all-read");
    });

    // ── Presence ──────────────────────────────────────────────────────────────
    socket.on("presence:away", () => io.to(wsRoom).emit("presence:changed", { userId: user.userId, status: "away" }));
    socket.on("presence:active", () => io.to(wsRoom).emit("presence:changed", { userId: user.userId, status: "online" }));

    // ── Analytics push ────────────────────────────────────────────────────────
    socket.on("analytics:request", () => socket.emit("analytics:updated", { requestedAt: new Date().toISOString() }));

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      socketToUser.delete(socket.id);
      await User.findByIdAndUpdate(user.userId, { online: false }).catch(() => undefined);
      io.to(wsRoom).emit("presence:changed", { userId: user.userId, online: false, status: "offline" });
    });
  });

  return io;
}
