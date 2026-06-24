import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth.js";
import { AIInsights, Meeting, Task, Transcript, User, AuditLog } from "../models.js";


export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

const workspace = (req: Express.Request) => ({ workspaceId: req.user!.workspaceId });

function formatMonth(d: Date) {
  const m = d.toLocaleString("en-US", { month: "short" });
  return m;
}

// Minimal MVP analytics endpoints (real DB-backed; UI wiring will consume these).
analyticsRouter.get("/dashboard", async (req, res) => {
  const userId = String((req.user as any)!._id);
  const [meetings, tasks, transcripts] = await Promise.all([
    Meeting.find(workspace(req)).select("start status score duration participants host").lean(),
    Task.find({ ...workspace(req), assignee: userId }).select("status priority aiScore updatedAt").lean(),
    Transcript.find(workspace(req)).select("meetingId atSeconds speaker text").lean(),
  ]);

  // Meeting trends: last 12 months buckets
  const now = new Date();
  const buckets: Array<{ month: string; meetings: number; focus: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: formatMonth(d), meetings: 0, focus: 0 });
  }

  const monthKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const bucketKeyToIndex = new Map<number, number>();

  // Compute range keys deterministically
  const rangeKeys: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rangeKeys.push(d.getTime());
  }
  rangeKeys.forEach((k, idx) => bucketKeyToIndex.set(k, idx));

  for (const m of meetings as any[]) {
    const idx = bucketKeyToIndex.get(monthKey(new Date(m.start)));
    if (idx === undefined) continue;
    buckets[idx].meetings += 1;
    // focus proxy: use duration for ended/live meetings
    buckets[idx].focus += Number(m.duration ?? 0);
  }

  // Productivity: last 7 days (user's completed tasks)
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { day: d.toLocaleString("en-US", { weekday: "short" }), score: 0 };
  });
  const dayKey = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x.getTime();
  };
  const dayKeyToIndex = new Map<number, number>();
  days.forEach((d, idx) => {
    const dd = new Date();
    // recreate date for idx
    dd.setDate(dd.getDate() - (6 - idx));
    dd.setHours(0, 0, 0, 0);
    dayKeyToIndex.set(dayKey(dd), idx);
  });
  for (const t of tasks as any[]) {
    const idx = dayKeyToIndex.get(dayKey(new Date(t.updatedAt)));
    if (idx === undefined) continue;
    days[idx].score += t.status === "done" ? 10 : 3;
  }

  // Effectiveness proxy: transcript words / meeting count
  const wordCount = transcripts.reduce((acc: number, t: any) => acc + String(t.text ?? "").split(/\s+/).filter(Boolean).length, 0);
  const meetingCount = meetings.length || 1;
  const effectiveness = [{ name: "Score", value: Math.min(100, Math.round((wordCount / meetingCount) / 10)) }];

  // Participation by teammate proxy: transcript speaker frequency
  const speakerCounts = new Map<string, number>();
  for (const t of transcripts as any[]) {
    const s = String(t.speaker || "Unknown");
    speakerCounts.set(s, (speakerCounts.get(s) ?? 0) + 1);
  }
  const topSpeakers = Array.from(speakerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.split(" ")[0], value: Math.min(100, Math.round(count * 2)) }));

  // Ensure charts have stable length for UI
  while (topSpeakers.length < 6) topSpeakers.push({ name: "—", value: 0 });

  return res.json({
    meetingTrends: buckets.map((b) => ({ month: b.month, meetings: b.meetings, focus: b.focus })),
    productivity: days,
    effectiveness,
    participation: topSpeakers,
    // AI recommendations from persisted AIInsights (workspace-scoped)
    aiRecommendations: (await AIInsights.find({
      workspaceId: (req.user as any)!.workspaceId,
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()).map((i: any) => i.summary ?? i.title),
  });
});


analyticsRouter.get("/recent-activity", async (req, res) => {
  const userId = String((req.user as any)!._id);
  const logs = await AuditLog.find({ 
    workspaceId: (req.user as any)!.workspaceId,
    actorUserId: userId 
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate<{ actorUserId: { _id: any; name: string; avatar?: string } }>("actorUserId", "name avatar")
    .lean();

  res.json(
    logs.map((l: any) => ({
      id: String(l._id),
      actor: { id: String(l.actorUserId?._id ?? ""), name: l.actorUserId?.name ?? "System", avatar: l.actorUserId?.avatar },
      eventType: l.eventType,
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      time: l.createdAt,
    }))
  );
});

analyticsRouter.get("/export", async (req, res) => {
  // Simple CSV export for the UI button in app.analytics.tsx.
  // Export meetingTrends dataset.
  // Compute directly to keep production-safe and avoid express Router internals.

  const [meetings] = await Promise.all([
    Meeting.find(workspace(req)).select("start").lean(),
  ]);

  const now = new Date();
  const buckets: Array<{ month: string; meetings: number; focus: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: formatMonth(d), meetings: 0, focus: 0 });
  }
  const rangeKeys: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rangeKeys.push(d.getTime());
  }
  const bucketKeyToIndex = new Map<number, number>();
  rangeKeys.forEach((k, idx) => bucketKeyToIndex.set(k, idx));
  const monthKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getTime();

  for (const m of meetings as any[]) {
    const idx = bucketKeyToIndex.get(monthKey(new Date(m.start)));
    if (idx === undefined) continue;
    buckets[idx].meetings += 1;
  }

  const header = "month,meetings,focus";
  const rows = buckets.map((b) => `${b.month},${b.meetings},${b.focus}`);
  const csv = [header, ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv;charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="intellmeet-analytics.csv"`);
  res.send(csv);
});

