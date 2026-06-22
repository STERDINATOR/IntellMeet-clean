import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { env } from "../config/env.js";
import { AISummary, Task, Transcript, Meeting, Notification } from "../models.js";
import { createAuditLog, emitToWorkspace, emitToMeeting } from "../realtime.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

const SYSTEM_PROMPT = "You are IntellMeet Copilot — an enterprise AI assistant. Be concise, structured, and actionable. Use bullet points. Always surface decisions, risks, and action items.";

// ─── SSE helpers ─────────────────────────────────────────────────────────────
function sseHeaders(res: import("express").Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
}

async function streamText(res: import("express").Response, prompt: string, system = SYSTEM_PROMPT): Promise<string> {
  sseHeaders(res);
  if (!openai) {
    const fallback = "AI streaming is ready. Add OPENAI_API_KEY to .env to enable live model responses.";
    res.write(`data: ${JSON.stringify({ delta: fallback })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
    return fallback;
  }
  const stream = await openai.chat.completions.create({
    model: env.openaiModel,
    stream: true,
    messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
  });
  let full = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) { full += delta; res.write(`data: ${JSON.stringify({ delta })}\n\n`); }
  }
  res.write("data: [DONE]\n\n");
  res.end();
  return full;
}

async function generateText(prompt: string, system = SYSTEM_PROMPT): Promise<string> {
  if (!openai) return "AI service not configured. Add OPENAI_API_KEY.";
  const res = await openai.chat.completions.create({
    model: env.openaiModel,
    messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
  });
  return res.choices[0]?.message?.content ?? "";
}

function transcriptText(items: any[]): string {
  return items.map((t) => `[${t.atSeconds ?? 0}s] ${t.speaker ?? "Unknown"}: ${t.text}`).join("\n");
}

// ─── Copilot Q&A stream ───────────────────────────────────────────────────────
aiRouter.post("/copilot/stream", async (req, res) => {
  const { prompt } = z.object({ prompt: z.string().min(1) }).parse(req.body);
  await streamText(res, prompt);
});

// ─── Meeting summary stream ───────────────────────────────────────────────────
aiRouter.post("/meetings/:id/summary/stream", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const meeting = await Meeting.findById(req.params.id).lean();
  const prompt = transcript.length
    ? `Summarize this meeting transcript for "${meeting?.title ?? "Meeting"}". Include:\n1. Key decisions made\n2. Action items with owners\n3. Risks identified\n4. Next steps\n\nTranscript:\n${transcriptText(transcript)}`
    : `Generate a professional meeting summary template for a "${meeting?.title ?? "meeting"}". Include sections for decisions, action items, risks, and next steps.`;

  const summary = await streamText(res, prompt);

  // Persist summary + emit
  if (summary) {
    const saved = await AISummary.findOneAndUpdate(
      { meetingId: req.params.id, workspaceId: req.user!.workspaceId },
      { summary, model: env.openaiModel, meetingId: req.params.id, workspaceId: req.user!.workspaceId },
      { upsert: true, new: true },
    ).catch(() => null);
    if (saved) {
      emitToWorkspace(String(req.user!.workspaceId), "ai:summary_generated", { meetingId: req.params.id, summaryId: String(saved._id) });
      emitToMeeting(req.params.id, "ai:summary_generated", { meetingId: req.params.id, summary });
    }
  }
  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "ai.summary_generated", resourceType: "meeting", resourceId: req.params.id });
});

// ─── Action items extraction ──────────────────────────────────────────────────
aiRouter.post("/meetings/:id/action-items", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const meeting = await Meeting.findById(req.params.id).lean();

  let items: { title: string; priority: "high" | "medium" | "low" }[] = [];

  if (transcript.length && openai) {
    const raw = await generateText(
      `From this meeting transcript, extract action items as JSON array: [{"title":"...","priority":"high|medium|low"}]\nTranscript:\n${transcriptText(transcript)}`,
      "You are an action item extractor. Return only valid JSON array, no markdown.",
    );
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      items = JSON.parse(cleaned);
    } catch {
      items = transcript.slice(0, 5).map((t, i) => ({ title: `Follow up: ${t.text.slice(0, 80)}`, priority: i === 0 ? "high" : "medium" as const }));
    }
  } else {
    items = [
      { title: `Review decisions from: ${meeting?.title ?? "meeting"}`, priority: "high" },
      { title: "Assign owners for identified risks", priority: "medium" },
      { title: "Schedule follow-up meeting", priority: "low" },
    ];
  }

  const tasks = await Task.insertMany(items.map((item) => ({
    title: item.title,
    priority: item.priority,
    workspaceId: req.user!.workspaceId,
    assignee: req.user!._id,
    status: "todo",
    due: new Date(Date.now() + 3 * 86400000),
    aiScore: 92,
    tags: ["ai", "meeting", "action-item"],
    description: `AI-extracted action item from meeting: ${meeting?.title ?? req.params.id}`,
  })));

  // Persist to AISummary
  await AISummary.findOneAndUpdate(
    { meetingId: req.params.id, workspaceId: req.user!.workspaceId },
    { $set: { actionItems: items, model: env.openaiModel, workspaceId: req.user!.workspaceId, meetingId: req.params.id } },
    { upsert: true },
  ).catch(() => undefined);

  // Notify user
  const n = await Notification.create({ workspaceId: req.user!.workspaceId, userId: req.user!._id, type: "ai", title: `${tasks.length} action items generated`, body: `From meeting: ${meeting?.title ?? req.params.id}` }).catch(() => null);
  if (n) emitToWorkspace(String(req.user!.workspaceId), "notification:created", n);

  emitToWorkspace(String(req.user!.workspaceId), "ai:actionitems_generated", { meetingId: req.params.id, count: tasks.length });
  emitToWorkspace(String(req.user!.workspaceId), "task:bulk_created", tasks);

  await createAuditLog({ workspaceId: String(req.user!.workspaceId), actorUserId: String(req.user!._id), eventType: "ai.action_items_generated", resourceType: "meeting", resourceId: req.params.id, after: { count: tasks.length } });

  res.status(201).json(tasks);
});

// ─── Transcript Q&A stream ────────────────────────────────────────────────────
aiRouter.post("/transcript/qa/stream", async (req, res) => {
  const { question, meetingId } = z.object({ question: z.string().min(1), meetingId: z.string() }).parse(req.body);
  const transcript = await Transcript.find({ meetingId, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const ctx = transcript.length ? transcriptText(transcript) : "No transcript available yet.";
  await streamText(res, `Answer this question based only on the meeting transcript below.\nQuestion: ${question}\n\nTranscript:\n${ctx}`);
});

// ─── Sentiment analysis ───────────────────────────────────────────────────────
aiRouter.post("/meetings/:id/sentiment", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  if (!transcript.length) return res.json({ overall: "neutral", score: 0.5, breakdown: [] });

  let result = { overall: "positive", score: 0.75, breakdown: [] as any[] };

  if (openai) {
    const raw = await generateText(
      `Analyze the sentiment of this meeting transcript. Return JSON: {"overall":"positive|negative|neutral","score":0-1,"breakdown":[{"speaker":"name","sentiment":"positive|negative|neutral","score":0-1}]}\n\nTranscript:\n${transcriptText(transcript)}`,
      "You are a sentiment analysis engine. Return only valid JSON, no markdown.",
    );
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch { /* use default */ }
  }

  emitToMeeting(req.params.id, "ai:sentiment_updated", { meetingId: req.params.id, ...result });
  emitToWorkspace(String(req.user!.workspaceId), "ai:sentiment_updated", { meetingId: req.params.id, ...result });

  res.json(result);
});

// ─── Workspace insights ───────────────────────────────────────────────────────
aiRouter.post("/insights/generate", async (req, res) => {
  const meetings = await Meeting.find({ workspaceId: req.user!.workspaceId }).sort({ start: -1 }).limit(20).lean();
  const tasks = await Task.find({ workspaceId: req.user!.workspaceId }).sort({ updatedAt: -1 }).limit(50).lean();

  const context = `
Meetings (last 20): ${meetings.map((m) => `${m.title} (${m.status}, score: ${m.score ?? "N/A"})`).join(", ")}
Tasks: ${tasks.filter((t) => t.status !== "done").length} open, ${tasks.filter((t) => t.status === "done").length} done
Urgent tasks: ${tasks.filter((t) => t.priority === "urgent").length}
  `.trim();

  const insights: { id: string; title: string; impact: string; severity: "success" | "warning" | "error" }[] = [];

  if (openai) {
    const raw = await generateText(
      `Based on this workspace data, generate 4 actionable insights as JSON array: [{"title":"...","impact":"...","severity":"success|warning|error"}]\n\nData:\n${context}`,
      "You are a workspace analytics AI. Return only valid JSON array, no markdown.",
    );
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      parsed.forEach((item: any, i: number) => insights.push({ id: `i${Date.now()}${i}`, ...item }));
    } catch { /* use defaults */ }
  }

  if (!insights.length) {
    insights.push(
      { id: "i1", title: `${tasks.filter((t) => t.priority === "urgent").length} urgent tasks need attention`, impact: "Review and assign owners immediately", severity: "error" },
      { id: "i2", title: `${meetings.filter((m) => m.status === "ended").length} meetings completed this period`, impact: "Check AI summaries for action items", severity: "success" },
      { id: "i3", title: "Task completion rate needs monitoring", impact: "Consider daily async standups", severity: "warning" },
    );
  }

  emitToWorkspace(String(req.user!.workspaceId), "ai:insights_updated", { insights });
  res.json(insights);
});

// ─── Get stored AI summary ────────────────────────────────────────────────────
aiRouter.get("/meetings/:id/summary", async (req, res) => {
  const summary = await AISummary.findOne({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ createdAt: -1 });
  if (!summary) return res.json(null);
  return res.json(summary);
});

// ─── Transcript search ───────────────────────────────────────────────────────
aiRouter.post("/transcripts/search", async (req, res) => {
  const { query, meetingId } = z.object({ query: z.string().min(1), meetingId: z.string().optional() }).parse(req.body);
  const filter: Record<string, any> = { workspaceId: req.user!.workspaceId };
  if (meetingId) filter.meetingId = meetingId;
  const segments = await Transcript.find({
    ...filter,
    $or: [
      { text: { $regex: query, $options: "i" } },
      { speaker: { $regex: query, $options: "i" } },
    ],
  }).sort({ atSeconds: 1 }).limit(50).lean();
  res.json(segments.map((s) => ({ ...s, id: String(s._id) })));
});

// ─── Mind map generation ──────────────────────────────────────────────────────
aiRouter.post("/meetings/:id/mindmap", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const meeting = await Meeting.findById(req.params.id).lean();

  let nodes: { id: string; label: string; type: "root" | "topic" | "decision" | "action" }[] = [];

  if (openai && transcript.length) {
    const raw = await generateText(
      `From this meeting transcript, extract a mind map as JSON array: [{"id":"1","label":"topic name","type":"root|topic|decision|action"}]\nTranscript:\n${transcriptText(transcript)}`,
      "You are a mind map generator. Return only valid JSON array, no markdown.",
    );
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      nodes = JSON.parse(cleaned);
    } catch { /* fallback below */ }
  }

  if (!nodes.length) {
    nodes = [
      { id: "root", label: meeting?.title ?? "Meeting", type: "root" },
      { id: "n1", label: "Decisions", type: "topic" },
      { id: "n2", label: "Action Items", type: "action" },
      { id: "n3", label: "Risks", type: "topic" },
    ];
  }

  res.json(nodes);
});
