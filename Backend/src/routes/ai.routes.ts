import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { env } from "../config/env.js";
import { AISummary, Task, Transcript } from "../models.js";

export const aiRouter = Router();
aiRouter.use(requireAuth);

const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

async function streamText(res: import("express").Response, prompt: string) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!openai) {
    const fallback = "AI is configured for streaming. Add OPENAI_API_KEY to enable live model responses.";
    res.write(`data: ${JSON.stringify({ delta: fallback })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  const stream = await openai.chat.completions.create({
    model: env.openaiModel,
    stream: true,
    messages: [
      { role: "system", content: "You are IntellMeet Copilot. Be concise, actionable, and enterprise-ready." },
      { role: "user", content: prompt },
    ],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) res.write(`data: ${JSON.stringify({ delta })}\n\n`);
  }
  res.write("data: [DONE]\n\n");
  res.end();
}

aiRouter.post("/copilot/stream", async (req, res) => {
  const { prompt } = z.object({ prompt: z.string().min(1) }).parse(req.body);
  await streamText(res, prompt);
});

aiRouter.post("/meetings/:id/summary/stream", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const prompt = `Summarize this meeting transcript. Include decisions, risks, and action items:\n${transcript.map(t => `${t.speaker}: ${t.text}`).join("\n")}`;
  await streamText(res, prompt);
});

aiRouter.post("/meetings/:id/action-items", async (req, res) => {
  const transcript = await Transcript.find({ meetingId: req.params.id, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  const items = transcript.length
    ? transcript.slice(0, 3).map((t, index) => ({ title: `Follow up: ${t.text.slice(0, 64)}`, priority: index === 0 ? "high" : "medium" }))
    : [
        { title: "Confirm meeting decisions", priority: "high" },
        { title: "Assign owners for next steps", priority: "medium" },
      ];
  const tasks = await Task.insertMany(items.map((item) => ({
    ...item,
    workspaceId: req.user!.workspaceId,
    assignee: req.user!._id,
    status: "todo",
    due: new Date(Date.now() + 3 * 86400000),
    aiScore: 92,
    tags: ["ai", "meeting"],
  })));
  await AISummary.create({ workspaceId: req.user!.workspaceId, meetingId: req.params.id, actionItems: items, model: env.openaiModel });
  res.status(201).json(tasks);
});

aiRouter.post("/transcript/qa/stream", async (req, res) => {
  const { question, meetingId } = z.object({ question: z.string(), meetingId: z.string() }).parse(req.body);
  const transcript = await Transcript.find({ meetingId, workspaceId: req.user!.workspaceId }).sort({ atSeconds: 1 });
  await streamText(res, `Answer this question from the transcript.\nQuestion: ${question}\nTranscript:\n${transcript.map(t => `${t.speaker}: ${t.text}`).join("\n")}`);
});
