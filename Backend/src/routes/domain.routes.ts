import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth.js";
import { Meeting, Message, Notification, Project, Report, Task, Transcript, User, Workspace, AuditLog } from "../models.js";
import { createAuditLog, emitToWorkspace, emitToMeeting } from "../realtime.js";

export const domainRouter = Router();
domainRouter.use(requireAuth);

const ws = (req: Express.Request) => ({ workspaceId: req.user!.workspaceId });
const ip = (req: import("express").Request) => String((req as any).headers?.["x-forwarded-for"] ?? (req as any).socket?.remoteAddress ?? "");
const ua = (req: import("express").Request) => String((req as any).headers?.["user-agent"] ?? "");

// ─── Meetings ─────────────────────────────────────────────────────────────────
domainRouter.get("/meetings", async (req, res) => {
  const userId = String(req.user!._id);
  res.json(await Meeting.find({ ...ws(req), $or: [{ host: userId }, { participants: userId }] }).sort({ start: -1 }));
});

domainRouter.get("/meetings/:id", async (req, res) => {
  const m = await Meeting.findOne({ _id: req.params.id, ...ws(req) });
  if (!m) return res.status(404).json({ message: "Meeting not found" });
  return res.json(m);
});

domainRouter.post("/meetings", async (req, res) => {
  const body = z.object({
    title: z.string().min(1),
    start: z.coerce.date(),
    duration: z.number().default(30),
    type: z.enum(["Team", "Client", "1:1", "All-hands"]).default("Team"),
    agenda: z.string().optional(),
    // participants are user ObjectIds in Mongo.
    // Frontend sometimes sends placeholders like "me" (string), so we sanitize below.
    participants: z.array(z.string()).default([]),
    status: z.enum(["upcoming", "live", "ended"]).default("upcoming"),
  }).parse(req.body);

  const sanitizeUserIds = (ids: string[]) => {
    const valid = ids.filter((x) => typeof x === "string" && x.length > 0);
    // Treat placeholder "me" as empty (host is derived from req.user).
    return valid.filter((x) => x !== "me");
  };

  const meeting = await Meeting.create({
    ...body,
    participants: sanitizeUserIds(body.participants),
    workspaceId: req.user!.workspaceId,
    host: req.user!._id,
    roomId: `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });

  emitToWorkspace(String(req.user!.workspaceId), "meeting:created", meeting);

  if (body.participants.length > 0) {
    const notifs = body.participants.map((userId) => ({
      workspaceId: req.user!.workspaceId,
      userId,
      type: "meeting" as const,
      title: `New meeting: ${body.title}`,
      body: `Scheduled by ${req.user!.name}`,
    }));
    const created = await Notification.insertMany(notifs).catch(() => []);
    created.forEach((n) => emitToWorkspace(String(req.user!.workspaceId), "notification:created", n));
  }

  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "meeting.created", resourceType: "meeting", resourceId: String(meeting._id), after: meeting, ip: ip(req), device: ua(req) });
  res.status(201).json(meeting);
});

domainRouter.patch("/meetings/:id", async (req, res) => {
  const before = await Meeting.findById(req.params.id).lean();
  const meeting = await Meeting.findOneAndUpdate({ _id: req.params.id, ...ws(req) }, req.body, { new: true });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  emitToWorkspace(String(req.user!.workspaceId), "meeting:updated", meeting);
  if (req.body.status === "ended") emitToMeeting(req.params.id, "meeting:ended", { meetingId: req.params.id });
  if (req.body.status === "live") emitToWorkspace(String(req.user!.workspaceId), "meeting:started", { meetingId: req.params.id, title: meeting.title });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "meeting.updated", resourceType: "meeting", resourceId: req.params.id, before, after: meeting, ip: ip(req), device: ua(req) });
  return res.json(meeting);
});

domainRouter.delete("/meetings/:id", async (req, res) => {
  const before = await Meeting.findById(req.params.id).lean();
  await Meeting.deleteOne({ _id: req.params.id, ...ws(req) });
  emitToWorkspace(String(req.user!.workspaceId), "meeting:deleted", { meetingId: req.params.id });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "meeting.deleted", resourceType: "meeting", resourceId: req.params.id, before, ip: ip(req), device: ua(req) });
  res.sendStatus(204);
});

// ─── Transcripts ──────────────────────────────────────────────────────────────
domainRouter.get("/meetings/:id/transcripts", async (req, res) => {
  res.json(await Transcript.find({ meetingId: req.params.id, ...ws(req) }).sort({ atSeconds: 1 }));
});

domainRouter.post("/meetings/:id/transcripts", async (req, res) => {
  const t = await Transcript.create({ ...req.body, meetingId: req.params.id, workspaceId: req.user!.workspaceId });
  emitToMeeting(req.params.id, "transcript:created", t);
  res.status(201).json(t);
});

// ─── Tasks ────────────────────────────────────────────────────────────────────
domainRouter.get("/tasks", async (req, res) => {
  const userId = String(req.user!._id);
  res.json(await Task.find({ ...ws(req), assignee: userId }).sort({ updatedAt: -1 }));
});

domainRouter.get("/tasks/:id", async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, ...ws(req) });
  if (!task) return res.status(404).json({ message: "Task not found" });
  return res.json(task);
});

domainRouter.post("/tasks", async (req, res) => {
  const body = { ...req.body };
  if (body.project === "" || body.project == null) delete body.project;
  if (body.assignee === "" || body.assignee == null) delete body.assignee;
  const task = await Task.create({ ...body, workspaceId: req.user!.workspaceId });
  emitToWorkspace(String(req.user!.workspaceId), "task:created", task);
  if (task.assignee) {
    const n = await Notification.create({ workspaceId: req.user!.workspaceId, userId: task.assignee, type: "task", title: `Task assigned: ${task.title}`, body: `Assigned by ${req.user!.name}` }).catch(() => null);
    if (n) emitToWorkspace(String(req.user!.workspaceId), "notification:created", n);
  }
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "task.created", resourceType: "task", resourceId: String(task._id), after: task, ip: ip(req), device: ua(req) });
  res.status(201).json(task);
});

domainRouter.patch("/tasks/:id", async (req, res) => {
  const before = await Task.findById(req.params.id).lean();
  const task = await Task.findOneAndUpdate({ _id: req.params.id, ...ws(req) }, req.body, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });
  emitToWorkspace(String(req.user!.workspaceId), "task:updated", task);
  if (task.status === "done") emitToWorkspace(String(req.user!.workspaceId), "task:completed", task);
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "task.updated", resourceType: "task", resourceId: req.params.id, before, after: task, ip: ip(req), device: ua(req) });
  return res.json(task);
});

domainRouter.delete("/tasks/:id", async (req, res) => {
  const before = await Task.findById(req.params.id).lean();
  await Task.deleteOne({ _id: req.params.id, ...ws(req) });
  emitToWorkspace(String(req.user!.workspaceId), "task:deleted", { taskId: req.params.id });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "task.deleted", resourceType: "task", resourceId: req.params.id, before, ip: ip(req), device: ua(req) });
  res.sendStatus(204);
});

// ─── Projects ─────────────────────────────────────────────────────────────────
domainRouter.get("/projects", async (req, res) => {
  const userId = String(req.user!._id);
  res.json(await Project.find({ ...ws(req), members: userId }).sort({ updatedAt: -1 }));
});

domainRouter.get("/projects/:id", async (req, res) => {
  const p = await Project.findOne({ _id: req.params.id, ...ws(req) });
  if (!p) return res.status(404).json({ message: "Project not found" });
  return res.json(p);
});

domainRouter.post("/projects", async (req, res) => {
  const project = await Project.create({ ...req.body, workspaceId: req.user!.workspaceId });
  emitToWorkspace(String(req.user!.workspaceId), "project:created", project);
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "project.created", resourceType: "project", resourceId: String(project._id), after: project, ip: ip(req), device: ua(req) });
  res.status(201).json(project);
});

domainRouter.patch("/projects/:id", async (req, res) => {
  const before = await Project.findById(req.params.id).lean();
  const project = await Project.findOneAndUpdate({ _id: req.params.id, ...ws(req) }, req.body, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  emitToWorkspace(String(req.user!.workspaceId), "project:updated", project);
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "project.updated", resourceType: "project", resourceId: req.params.id, before, after: project, ip: ip(req), device: ua(req) });
  return res.json(project);
});

domainRouter.delete("/projects/:id", async (req, res) => {
  const before = await Project.findById(req.params.id).lean();
  await Project.deleteOne({ _id: req.params.id, ...ws(req) });
  emitToWorkspace(String(req.user!.workspaceId), "project:deleted", { projectId: req.params.id });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "project.deleted", resourceType: "project", resourceId: req.params.id, before, ip: ip(req), device: ua(req) });
  res.sendStatus(204);
});

// ─── Notifications ────────────────────────────────────────────────────────────
domainRouter.get("/notifications", async (req, res) => {
  res.json(await Notification.find({ userId: req.user!._id, ...ws(req) }).sort({ createdAt: -1 }).limit(100));
});

domainRouter.post("/notifications", async (req, res) => {
  const n = await Notification.create({ ...req.body, userId: req.user!._id, workspaceId: req.user!.workspaceId });
  emitToWorkspace(String(req.user!.workspaceId), "notification:created", n);
  res.status(201).json(n);
});

domainRouter.post("/notifications/read-all", async (req, res) => {
  await Notification.updateMany({ userId: req.user!._id, ...ws(req) }, { read: true });
  emitToWorkspace(String(req.user!.workspaceId), "notification:all-read", { userId: String(req.user!._id) });
  res.sendStatus(204);
});

domainRouter.post("/notifications/:id/read", async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!._id, ...ws(req) }, { read: true }, { new: true });
  if (!n) return res.status(404).json({ message: "Not found" });
  return res.json(n);
});

domainRouter.delete("/notifications/:id", async (req, res) => {
  await Notification.deleteOne({ _id: req.params.id, userId: req.user!._id, ...ws(req) });
  emitToWorkspace(String(req.user!.workspaceId), "notification:deleted", { notificationId: req.params.id });
  res.sendStatus(204);
});

// ─── Chat history ─────────────────────────────────────────────────────────────
domainRouter.get("/chat/:roomId", async (req, res) => {
  res.json(await Message.find({ roomId: req.params.roomId, ...ws(req) }).sort({ createdAt: 1 }).limit(200));
});

// ─── Reports ──────────────────────────────────────────────────────────────────
domainRouter.get("/reports", async (req, res) => {
  res.json(await Report.find(ws(req)).sort({ createdAt: -1 }));
});

domainRouter.post("/reports", async (req, res) => {
  const report = await Report.create({ ...req.body, workspaceId: req.user!.workspaceId });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "report.created", resourceType: "report", resourceId: String(report._id), after: report, ip: ip(req), device: ua(req) });
  res.status(201).json(report);
});

// ─── Workspace ────────────────────────────────────────────────────────────────
domainRouter.get("/workspace", async (req, res) => {
  const workspace = await Workspace.findById(req.user!.workspaceId);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  return res.json(workspace);
});

domainRouter.patch("/workspace", requireRole("admin"), async (req, res) => {
  const before = await Workspace.findById(req.user!.workspaceId).lean();
  const workspace = await Workspace.findByIdAndUpdate(req.user!.workspaceId, req.body, { new: true });
  if (!workspace) return res.status(404).json({ message: "Not found" });
  emitToWorkspace(String(req.user!.workspaceId), "workspace:updated", workspace);
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "workspace.updated", resourceType: "workspace", resourceId: String(req.user!.workspaceId), before, after: workspace, ip: ip(req), device: ua(req) });
  return res.json(workspace);
});

// ─── Team invitations ─────────────────────────────────────────────────────────
domainRouter.post("/team/invitations", requireRole("admin", "manager"), async (req, res) => {
  const { email, projectId } = z.object({ email: z.string().email(), projectId: z.string().optional() }).parse(req.body);
  const existing = await User.findOne({ email: email.toLowerCase(), workspaceId: req.user!.workspaceId });
  if (existing && projectId) {
    await Project.findByIdAndUpdate(projectId, { $addToSet: { members: existing._id } });
    emitToWorkspace(String(req.user!.workspaceId), "project:updated", { _id: projectId });
    return res.json({ message: "User added to project" });
  }
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "team.invited", resourceType: "user", resourceId: email, after: { email, projectId }, ip: ip(req), device: ua(req) });
  res.json({ message: `Invitation queued for ${email}` });
});

// ─── User profile update ──────────────────────────────────────────────────────
domainRouter.patch("/users/me", async (req, res) => {
  const allowed = z.object({ name: z.string().min(1).optional(), department: z.string().optional(), avatar: z.string().optional() }).parse(req.body);
  const before = await User.findById(req.user!._id).lean();
  const user = await User.findByIdAndUpdate(req.user!._id, allowed, { new: true }).select("-passwordHash -refreshTokenHash -resetTokenHash");
  if (!user) return res.status(404).json({ message: "Not found" });
  emitToWorkspace(String(req.user!.workspaceId), "user:updated", { id: String(user._id), name: user.name, avatar: user.avatar, department: user.department });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "user.profile_updated", resourceType: "user", resourceId: String(req.user!._id), before, after: user, ip: ip(req), device: ua(req) });
  return res.json(user);
});

// ─── Password change ─────────────────────────────────────────────────────
domainRouter.patch("/users/me/password", async (req, res) => {
  const { password } = z.object({ password: z.string().min(8) }).parse(req.body);
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.default.hash(password, 12);
  await User.findByIdAndUpdate(req.user!._id, { passwordHash: hash });
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "user.password_changed", resourceType: "user", resourceId: String(req.user!._id) });
  res.sendStatus(204);
});

// ─── Audit logs (admin only) ──────────────────────────────────────────────────
domainRouter.get("/audit-logs", requireRole("admin"), async (req, res) => {
  const page = Number(req.query.page ?? 0);
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const [logs, total] = await Promise.all([
    AuditLog.find({ workspaceId: req.user!.workspaceId }).sort({ createdAt: -1 }).skip(page * limit).limit(limit),
    AuditLog.countDocuments({ workspaceId: req.user!.workspaceId }),
  ]);
  res.json({ logs, total, page, limit });
});

// ─── Presence list ────────────────────────────────────────────────────────────
domainRouter.get("/presence", async (req, res) => {
  const users = await User.find({ workspaceId: req.user!.workspaceId }).select("_id name avatar online").lean();
  res.json(users.map((u) => ({ id: String(u._id), name: u.name, avatar: u.avatar, online: u.online })));
});
