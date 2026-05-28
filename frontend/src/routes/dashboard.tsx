import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Home, Video, Calendar, MessageSquare, Brain, Folder, BarChart3, Settings,
  Search, Bell, Plus, Sparkles, TrendingUp, Clock, CheckCircle2, ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — IntellMeet" }] }),
  component: DashboardPage,
});

const nav = [
  { icon: Home, label: "Home", active: true },
  { icon: Video, label: "Meetings" },
  { icon: Calendar, label: "Calendar" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Brain, label: "AI Assistant" },
  { icon: Folder, label: "Projects" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const upcoming = [
  { title: "Design Review", time: "10:00 AM · 45 min", color: "from-primary to-magenta" },
  { title: "Product Roadmap", time: "1:30 PM · 1 hr", color: "from-cyan to-primary" },
  { title: "Team Sync", time: "4:00 PM · 30 min", color: "from-magenta to-primary" },
];

const stats = [
  { label: "Meetings this week", value: "24", trend: "+12%", icon: Video },
  { label: "AI summaries", value: "182", trend: "+24%", icon: Brain },
  { label: "Tasks completed", value: "47", trend: "+8%", icon: CheckCircle2 },
  { label: "Focus time", value: "18h", trend: "+21%", icon: Clock },
];

export function DashboardPage() {
  return (
    <main className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <div className="p-6 lg:p-8 space-y-6">
          <Greeting />
          <StatsGrid />
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <UpcomingMeetings />
            <AIInsights />
          </div>
          <Activity />
        </div>
      </div>
    </main>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/5 flex-col p-5 sticky top-0 h-screen">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="size-8 rounded-lg bg-[var(--gradient-primary)] grid place-items-center glow-primary">
          <Sparkles className="size-4 text-white" />
        </div>
        <span className="font-display font-semibold">Intell<span className="text-gradient">Meet</span></span>
      </Link>
      <nav className="space-y-0.5">
        {nav.map((n) => (
          <button
            key={n.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              n.active ? "bg-[var(--gradient-primary)] text-white glow-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <n.icon className="size-4" /> {n.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto glass-strong border-gradient rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs font-medium mb-1">
          <Sparkles className="size-3.5 text-primary" /> Upgrade to Pro
        </div>
        <p className="text-xs text-muted-foreground mb-3">Unlock unlimited AI insights and analytics.</p>
        <button className="w-full text-xs rounded-lg py-2 bg-[var(--gradient-primary)] text-white">Upgrade</button>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/5 px-6 lg:px-8 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2 flex-1 max-w-md glass rounded-xl px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input placeholder="Search anything..." className="flex-1 bg-transparent text-sm outline-none" />
        <kbd className="text-[10px] text-muted-foreground glass px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>
      <Link to="/meeting" className="hidden sm:inline-flex items-center gap-2 text-sm rounded-xl px-4 py-2 bg-[var(--gradient-primary)] text-white glow-primary">
        <Plus className="size-4" /> New Meeting
      </Link>
      <button className="size-9 rounded-xl glass grid place-items-center relative">
        <Bell className="size-4" />
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-magenta" />
      </button>
      <div className="size-9 rounded-full bg-gradient-to-br from-primary to-magenta" />
    </header>
  );
}

function Greeting() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold">Welcome back, Alex 👋</h1>
      <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your team today.</p>
    </motion.div>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.06 }}
          className="glass border-gradient rounded-2xl p-5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="size-9 rounded-xl glass-strong grid place-items-center">
              <s.icon className="size-4 text-primary" />
            </div>
            <span className="text-xs text-emerald-400 inline-flex items-center gap-0.5">
              <TrendingUp className="size-3" />{s.trend}
            </span>
          </div>
          <div className="font-display text-3xl font-semibold">{s.value}</div>
          <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function UpcomingMeetings() {
  return (
    <div className="glass border-gradient rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-semibold">Upcoming Meetings</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          View calendar <ArrowUpRight className="size-3" />
        </button>
      </div>
      <ul className="space-y-3">
        {upcoming.map((m, i) => (
          <motion.li
            key={m.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 glass rounded-xl p-3 hover:bg-white/5 transition-colors"
          >
            <div className={`size-10 rounded-xl bg-gradient-to-br ${m.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-xs text-muted-foreground">{m.time}</p>
            </div>
            <Link to="/meeting" className="text-xs rounded-lg px-3 py-1.5 bg-[var(--gradient-primary)] text-white">Join</Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function AIInsights() {
  return (
    <div className="glass-strong border-gradient rounded-2xl p-6 relative overflow-hidden">
      <div aria-hidden className="absolute -top-20 -right-10 size-40 rounded-full blur-3xl" style={{ background: "var(--gradient-primary)", opacity: 0.4 }} />
      <div className="flex items-center gap-2 mb-1">
        <Brain className="size-4 text-primary" />
        <h3 className="font-display text-lg font-semibold">AI Summary</h3>
      </div>
      <p className="text-xs text-muted-foreground">Last 7 days · activity</p>
      <div className="h-24 flex items-end gap-1 mt-5">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-magenta"
            style={{ height: `${30 + Math.sin(i * 0.5) * 30 + Math.random() * 30}%` }}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">Engagement</p>
          <p className="font-display text-xl font-semibold mt-1">72%</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-[10px] text-muted-foreground">Focus time</p>
          <p className="font-display text-xl font-semibold mt-1">3h 42m</p>
        </div>
      </div>
    </div>
  );
}

function Activity() {
  const items = [
    { who: "Sarah", what: "shared a file in Design Review", when: "2m ago" },
    { who: "Mike", what: "commented on Roadmap Q2", when: "5m ago" },
    { who: "You", what: "joined Design Review", when: "10m ago" },
    { who: "Lena", what: "completed task: Logo refresh", when: "1h ago" },
  ];
  return (
    <div className="glass border-gradient rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold mb-5">Recent Activity</h3>
      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.what} className="flex items-center gap-3 text-sm">
            <div className="size-8 rounded-full bg-gradient-to-br from-primary to-magenta shrink-0" />
            <p className="flex-1"><span className="font-medium">{a.who}</span> <span className="text-muted-foreground">{a.what}</span></p>
            <span className="text-xs text-muted-foreground">{a.when}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
