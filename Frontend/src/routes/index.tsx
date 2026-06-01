import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play, CheckCircle2, Users, Calendar, TrendingUp, ShieldCheck, ChevronDown, Sparkles, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "@/lib/stores";
import heroImg from "@/assets/auth-portal.jpg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntellMeet — Meet Smarter. Collaborate Better. Powered by AI." },
      { name: "description", content: "Real-time meetings, AI summaries, smart action items, and team collaboration — all in one intelligent workspace." },
      { property: "og:title", content: "IntellMeet — AI-Powered Collaboration" },
      { property: "og:description", content: "Meet smarter. Collaborate better. Powered by AI." },
    ],
  }),
  component: Landing,
});

const navItems = [
  { label: "Product", has: true },
  { label: "Features", has: true },
  { label: "Solutions", has: true },
  { label: "Pricing", has: false },
  { label: "Resources", has: true },
];

const stats = [
  { icon: Users, value: "10K+", label: "Active Teams", sub: "Growing every day" },
  { icon: Calendar, value: "5000+", label: "Daily Meetings", sub: "Across all workspace" },
  { icon: TrendingUp, value: "40-60%", label: "Time Saved", sub: "On manual tasks" },
  { icon: ShieldCheck, value: "99.95%", label: "Uptime", sub: "Reliable and secure" },
];

const brands = ["Google", "Microsoft", "airbnb", "Notion", "Atlassian", "Spotify"];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="relative h-9 w-9 rounded-xl gradient-primary glow flex items-center justify-center">
        <div className="h-4 w-4 rotate-45 bg-background/30 rounded-sm" />
      </div>
      <span className="text-xl font-bold tracking-tight">IntellMeet</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function Landing() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-mesh" />
      <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />

      {/* NAV */}
      <nav className="relative z-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <Logo />
          <div className="hidden lg:flex items-center gap-8 text-sm">
            {navItems.map((n) => (
              <button key={n.label} onClick={() => setDemoOpen(true)} className="flex items-center gap-1 text-foreground/80 hover:text-foreground transition-colors">
                {n.label}
                {n.has && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="outline" className="rounded-full h-10 px-5 border-border/80">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="rounded-full h-10 px-5 gradient-primary text-primary-foreground border-0 glow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-10 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground/90">AI-Powered Collaboration Platform</span>
            </div>
            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Meet Smarter.<br />
              Collaborate <span className="gradient-text">Better.</span><br />
              Powered by <span className="gradient-text">AI.</span>
            </h1>
            <p className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Real-time meetings, AI summaries, smart action items, and team collaboration — all in one intelligent workspace.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-7 rounded-xl gradient-primary text-primary-foreground border-0 glow text-base">
                  Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => setDemoOpen(true)} className="h-12 px-7 rounded-xl border-border/80 text-base">
                <Play className="mr-1 h-4 w-4" /> Watch Demo
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>No credit card required</span>
              <span className="mx-1">•</span>
              <span>Start in seconds</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
            <div className="absolute inset-0 -m-10 blur-3xl opacity-70 bg-gradient-glow" />
            <img src={heroImg} alt="IntellMeet AI workspace" width={1280} height={1024} className="relative rounded-3xl w-full" />
          </motion.div>
        </div>

        {/* STATS */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Card className="p-6 bg-card/40 border border-border/60 rounded-2xl backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold gradient-text leading-none">{s.value}</div>
                    <div className="mt-1.5 font-medium text-sm">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.sub}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* TRUSTED BY */}
        <div className="mt-24 text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Trusted by innovative teams</div>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-14 gap-y-5 opacity-80">
            {brands.map((b) => (
              <div key={b} className="text-2xl font-semibold tracking-tight">{b}</div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8 mt-10 relative">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><div className="h-5 w-5 rounded gradient-primary" /> © 2026 IntellMeet, Inc.</div>
          <div className="flex gap-6"><a href="#" className="hover:text-foreground">Privacy</a><a href="#" className="hover:text-foreground">Terms</a><a href="#" className="hover:text-foreground">Security</a></div>
        </div>
      </footer>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>IntellMeet demo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video rounded-xl bg-secondary/60 border border-border flex items-center justify-center">
              <Play className="h-10 w-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Preview the end-to-end flow: schedule a meeting, join the live room, generate AI action items, and export reports.</p>
            <Link to="/signup"><Button className="w-full gradient-primary text-primary-foreground border-0">Start free trial</Button></Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
