import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { Message, Notification, User } from "./models.js";

type SocketUser = {
  userId: string;
  workspaceId: string;
  name: string;
  role: string;
};

export function createRealtimeServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing token"));
    try {
      const payload = jwt.verify(token, env.jwtAccessSecret) as jwt.JwtPayload;
      if (!payload.sub || !payload.workspaceId || !payload.name || !payload.role) {
        return next(new Error("Invalid token payload"));
      }
      socket.data.user = {
        userId: String(payload.sub),
        workspaceId: String(payload.workspaceId),
        name: String(payload.name),
        role: String(payload.role),
      } satisfies SocketUser;
      return next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.data.user as SocketUser;
    const workspaceRoom = `workspace:${user.workspaceId}`;
    socket.join(workspaceRoom);
    await User.findByIdAndUpdate(user.userId, { online: true });
    io.to(workspaceRoom).emit("presence:changed", { userId: user.userId, online: true });

    socket.on("meeting:join", ({ roomId }) => {
      socket.join(`meeting:${roomId}`);
      socket.to(`meeting:${roomId}`).emit("meeting:participant-joined", { userId: user.userId, name: user.name });
    });

    socket.on("meeting:leave", ({ roomId }) => {
      socket.leave(`meeting:${roomId}`);
      socket.to(`meeting:${roomId}`).emit("meeting:participant-left", { userId: user.userId });
    });

    socket.on("webrtc:offer", ({ roomId, to, offer }) => socket.to(to ?? `meeting:${roomId}`).emit("webrtc:offer", { from: socket.id, userId: user.userId, offer }));
    socket.on("webrtc:answer", ({ roomId, to, answer }) => socket.to(to ?? `meeting:${roomId}`).emit("webrtc:answer", { from: socket.id, userId: user.userId, answer }));
    socket.on("webrtc:ice-candidate", ({ roomId, to, candidate }) => socket.to(to ?? `meeting:${roomId}`).emit("webrtc:ice-candidate", { from: socket.id, userId: user.userId, candidate }));
    socket.on("meeting:reaction", ({ roomId, reaction }) => io.to(`meeting:${roomId}`).emit("meeting:reaction", { userId: user.userId, reaction }));
    socket.on("meeting:control", ({ roomId, control, value }) => socket.to(`meeting:${roomId}`).emit("meeting:control", { userId: user.userId, control, value }));

    socket.on("chat:message", async ({ roomId, text }) => {
      const message = await Message.create({ workspaceId: user.workspaceId, roomId, userId: user.userId, text });
      io.to(`meeting:${roomId}`).emit("chat:message", message);
    });

    socket.on("typing:start", ({ roomId }) => socket.to(`meeting:${roomId}`).emit("typing:start", { userId: user.userId, name: user.name }));
    socket.on("typing:stop", ({ roomId }) => socket.to(`meeting:${roomId}`).emit("typing:stop", { userId: user.userId }));
    socket.on("task:updated", (payload) => io.to(workspaceRoom).emit("task:updated", payload));

    socket.on("notification:create", async (payload) => {
      const notification = await Notification.create({ ...payload, workspaceId: user.workspaceId });
      io.to(workspaceRoom).emit("notification:created", notification);
    });

    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(user.userId, { online: false });
      io.to(workspaceRoom).emit("presence:changed", { userId: user.userId, online: false });
    });
  });

  return io;
}
