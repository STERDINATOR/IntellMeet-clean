import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Video, ListChecks, Clock, TrendingUp, Sparkles, Plus, ArrowRight, Calendar, Zap } from "lucide-react";
import { useMeetingsStore, useTasksStore } from "@/lib/stores";
import { aiInsights, recentActivity, findUser, analytics } from "@/lib/mock";
import { format, formatDistanceToNow } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar } from "recharts";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { meetings, add } = useMeetingsStore();
  const tasks = useTasksStore((s) => s.tasks);
  const upcoming = meetings.filter((m) => m.status === "upcoming").slice(0, 4);
  const recent = meetings.filter((m) => m.status === "ended").slice(0, 3);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const startInstant = (title: string) => {
    const id = add({ title: title || "Instant Meeting", start: new Date().toISOString(), duration: 30, status: "live", participants: ["me"], host: "me", type: "Team" });
    toast.success("Meeting started");
    setOpen(false);
    navigate({ to: "/app/room/$id", params: { id } });
  };

  return (
    <div>
      <PageHeader
        title="Welcome back, Alex 👋"
        subtitle="Here's what's happening across your workspace today."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/app/meetings/new" })}><Calendar className="h-4 w-4 mr-2" />Schedule</Button>
            <Button className="gradient-primary text-primary-foreground border-0 glow" onClick={() => setOpen(true)}><Zap className="h-4 w-4 mr-2" />Start Instant Meeting</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Meetings Today" value={upcoming.length} change="+2 vs yesterday" icon={Video} accent="primary" />
        <StatCard label="Meeting Score" value="92" change="+4 pts this week" icon={TrendingUp} accent="success" />
        <StatCard label="Tasks Completed" value={tasks.filter(t=>t.status==="done").length} change="+8 today" icon={ListChecks} accent="accent" />
        <StatCard label="Focus Time" value="4.2h" change="+18% vs avg" icon={Clock} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 p-6 bg-card/60 border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold">Upcoming meetings</div>
              <div className="text-xs text-muted-foreground">Next 24 hours</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/app/meetings" })}>View all <ArrowRight className="h-3 w-3 ml-1" /></Button>
          </div>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-secondary/60 transition cursor-pointer" onClick={() => navigate({ to: "/app/room/$id", params: { id: m.id } })}>
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {format(new Date(m.start), "HH:mm")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.duration}min • {m.type} • {m.participants.length} participants</div>
                </div>
                <div className="flex -space-x-2">
                  {m.participants.slice(0,3).map((id) => {
                    const u = findUser(id);
                    return <Avatar key={id} className="h-7 w-7 ring-2 ring-background"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>;
                  })}
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={(e) => { e.stopPropagation(); navigate({ to: "/app/room/$id", params: { id: m.id } }); }}>Join</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="font-semibold">AI Meeting Summary</div>
            </div>
            <div className="text-xs text-muted-foreground mb-3">Design Critique • 1h ago</div>
            <p className="text-sm leading-relaxed">Team aligned on Aurora v2 tokens. Maya to ship the audit by Wednesday; Noah to wire the new theme into the room. 3 decisions, 4 action items, 1 risk.</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="secondary">3 decisions</Badge>
              <Badge variant="secondary">4 actions</Badge>
            </div>
            <Button variant="link" className="px-0 mt-2" onClick={() => navigate({ to: "/app/meetings/$id", params: { id: "m4" } })}>Open summary <ArrowRight className="h-3 w-3 ml-1" /></Button>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-6 bg-card/60 border-border/60 lg:col-span-2">
          <div className="font-semibold mb-3">Team productivity</div>
          <div className="h-48">
            <ResponsiveContainer>
              <AreaChart data={analytics.meetingTrends}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="meetings" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><div className="font-semibold">AI Insights</div></div>
          <div className="space-y-3">
            {aiInsights.map((i) => (
              <div key={i.id} className="rounded-xl bg-secondary/40 p-3">
                <div className="text-sm font-medium">{i.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{i.impact}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-6 bg-card/60 border-border/60">
          <div className="font-semibold mb-3">Tasks overview</div>
          <div className="space-y-3">
            {(["todo","in_progress","review","done"] as const).map((s) => {
              const count = tasks.filter(t => t.status === s).length;
              const pct = (count / tasks.length) * 100;
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1"><span className="capitalize">{s.replace("_"," ")}</span><span className="text-muted-foreground">{count}</span></div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60">
          <div className="font-semibold mb-3">Recent meetings</div>
          <div className="space-y-2">
            {recent.map((m) => (
              <div key={m.id} className="flex items-center gap-3 hover:bg-secondary/60 p-2 rounded-lg cursor-pointer" onClick={() => navigate({ to: "/app/meetings/$id", params: { id: m.id } })}>
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center"><Video className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{format(new Date(m.start), "MMM d, HH:mm")}</div>
                </div>
                <Badge variant="secondary">{m.score}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60">
          <div className="font-semibold mb-3">Recent activity</div>
          <div className="space-y-3">
            {recentActivity.map((a) => {
              const u = findUser(a.user);
              return (
                <div key={a.id} className="flex gap-3 text-sm">
                  <Avatar className="h-7 w-7"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <span className="font-medium">{u.name}</span> <span className="text-muted-foreground">{a.action}</span> <span className="font-medium">{a.target}</span>
                    <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.time), { addSuffix: true })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Start an instant meeting</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); startInstant(String(f.get("title") || "")); }} className="space-y-4">
            <div className="space-y-1.5"><Label>Meeting title</Label><Input name="title" placeholder="Quick sync" autoFocus /></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0"><Plus className="h-4 w-4 mr-1" />Start now</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
