import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { Meeting, Message, Notification, Project, Report, Task, Transcript } from "../models.js";

export const domainRouter = Router();
domainRouter.use(requireAuth);

const workspace = (req: Express.Request) => ({ workspaceId: req.user!.workspaceId });

domainRouter.get("/meetings", async (req, res) => res.json(await Meeting.find(workspace(req)).sort({ start: -1 })));
domainRouter.get("/meetings/:id", async (req, res) => {
  const meeting = await Meeting.findOne({ _id: req.params.id, ...workspace(req) });
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  return res.json(meeting);
});
domainRouter.post("/meetings", async (req, res) => {
  const body = z.object({
    title: z.string(),
    start: z.coerce.date(),
    duration: z.number().default(30),
    type: z.enum(["Team", "Client", "1:1", "All-hands"]).default("Team"),
    agenda: z.string().optional(),
    participants: z.array(z.string()).default([]),
    status: z.enum(["upcoming", "live", "ended"]).default("upcoming"),
  }).parse(req.body);
  const meeting = await Meeting.create({
    ...body,
    workspaceId: req.user!.workspaceId,
    host: req.user!._id,
    roomId: `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });
  res.status(201).json(meeting);
});
domainRouter.patch("/meetings/:id", async (req, res) => res.json(await Meeting.findOneAndUpdate({ _id: req.params.id, ...workspace(req) }, req.body, { new: true })));
domainRouter.delete("/meetings/:id", async (req, res) => { await Meeting.deleteOne({ _id: req.params.id, ...workspace(req) }); res.sendStatus(204); });

domainRouter.get("/meetings/:id/transcripts", async (req, res) => res.json(await Transcript.find({ meetingId: req.params.id, ...workspace(req) }).sort({ atSeconds: 1 })));
domainRouter.post("/meetings/:id/transcripts", async (req, res) => res.status(201).json(await Transcript.create({ ...req.body, meetingId: req.params.id, workspaceId: req.user!.workspaceId })));

domainRouter.get("/tasks", async (req, res) => res.json(await Task.find(workspace(req)).sort({ updatedAt: -1 })));
domainRouter.post("/tasks", async (req, res) => res.status(201).json(await Task.create({ ...req.body, workspaceId: req.user!.workspaceId })));
domainRouter.patch("/tasks/:id", async (req, res) => res.json(await Task.findOneAndUpdate({ _id: req.params.id, ...workspace(req) }, req.body, { new: true })));
domainRouter.delete("/tasks/:id", async (req, res) => { await Task.deleteOne({ _id: req.params.id, ...workspace(req) }); res.sendStatus(204); });

domainRouter.get("/projects", async (req, res) => res.json(await Project.find(workspace(req)).sort({ updatedAt: -1 })));
domainRouter.post("/projects", async (req, res) => res.status(201).json(await Project.create({ ...req.body, workspaceId: req.user!.workspaceId })));
domainRouter.patch("/projects/:id", async (req, res) => res.json(await Project.findOneAndUpdate({ _id: req.params.id, ...workspace(req) }, req.body, { new: true })));

domainRouter.get("/notifications", async (req, res) => res.json(await Notification.find({ userId: req.user!._id, ...workspace(req) }).sort({ createdAt: -1 })));
domainRouter.post("/notifications", async (req, res) => res.status(201).json(await Notification.create({ ...req.body, userId: req.user!._id, workspaceId: req.user!.workspaceId })));
domainRouter.post("/notifications/read-all", async (req, res) => { await Notification.updateMany({ userId: req.user!._id, ...workspace(req) }, { read: true }); res.sendStatus(204); });
domainRouter.post("/notifications/:id/read", async (req, res) => res.json(await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!._id, ...workspace(req) }, { read: true }, { new: true })));
domainRouter.delete("/notifications/:id", async (req, res) => { await Notification.deleteOne({ _id: req.params.id, userId: req.user!._id, ...workspace(req) }); res.sendStatus(204); });

domainRouter.get("/chat/:roomId", async (req, res) => res.json(await Message.find({ roomId: req.params.roomId, ...workspace(req) }).sort({ createdAt: 1 }).limit(200)));
domainRouter.post("/reports", async (req, res) => res.status(201).json(await Report.create({ ...req.body, workspaceId: req.user!.workspaceId })));
