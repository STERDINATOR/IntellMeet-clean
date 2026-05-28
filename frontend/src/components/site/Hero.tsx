import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Sparkles,
  MessageSquare,
  Monitor,
  Brain,
  Mic,
  Video,
  PhoneOff,
  Users,
} from "lucide-react";
import heroImg from "@/assets/hero-meeting.jpg";
import { Link } from "@tanstack/react-router";

const chips = [
  { icon: Sparkles, label: "AI Summaries" },
  { icon: MessageSquare, label: "Real-time Chat" },
  { icon: Monitor, label: "Screen Sharing" },
  { icon: Brain, label: "Smart Insights" },
];

export function Hero() {
  return (
    <section className="relative pt-36 sm:pt-44 pb-24 overflow-hidden">
      {/* Aurora background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-90"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs glass border-gradient"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-foreground/80">AI-Powered Collaboration Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]"
            >
              Meet Smarter.
              <br />
              Collaborate Better.
              <br />
              <span className="text-gradient">Achieve More.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl"
            >
              IntellMeet brings your teams together with AI-driven insights,
              real-time collaboration and next-gen meetings.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium text-white bg-[var(--gradient-primary)] glow-primary hover:scale-[1.02] transition-transform"
              >
                Start Free Trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium glass border-gradient hover:bg-white/5 transition-colors">
                <span className="grid place-items-center size-6 rounded-full bg-white/10">
                  <Play className="size-3 fill-white text-white ml-0.5" />
                </span>
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-2"
            >
              {chips.map((c) => (
                <div
                  key={c.label}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl glass text-xs text-muted-foreground"
                >
                  <c.icon className="size-3.5 text-primary" />
                  {c.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative animate-float">
              {/* Glow ring */}
              <div
                aria-hidden
                className="absolute -inset-8 rounded-full opacity-60 blur-3xl -z-10"
                style={{ background: "var(--gradient-primary)" }}
              />

              {/* Main meeting card */}
              <div className="glass-strong rounded-3xl overflow-hidden border-gradient relative">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-[var(--gradient-primary)] grid place-items-center">
                      <Sparkles className="size-3 text-white" />
                    </div>
                    <span className="text-sm font-medium">Team Standup</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-destructive/20 text-destructive text-[10px] font-semibold">
                      <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                      Live
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">01:24:35</span>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="size-6 rounded-full ring-2 ring-background bg-gradient-to-br from-primary to-magenta"
                      />
                    ))}
                    <div className="size-6 rounded-full ring-2 ring-background bg-white/10 grid place-items-center text-[10px] font-medium">
                      +7
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-2 p-3">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                    <img
                      src={heroImg}
                      alt="Live AI-powered team meeting with participants"
                      width={1600}
                      height={1200}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center gap-1.5">
                      {[Mic, Video, Monitor, Users, MessageSquare].map((Icon, i) => (
                        <button
                          key={i}
                          className="size-8 rounded-full glass-strong grid place-items-center hover:bg-white/10 transition-colors"
                        >
                          <Icon className="size-3.5" />
                        </button>
                      ))}
                      <button className="size-8 rounded-full bg-destructive grid place-items-center">
                        <PhoneOff className="size-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2 w-20">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gradient-to-br from-accent to-muted relative overflow-hidden"
                      >
                        <div className="absolute bottom-1 left-1 size-1.5 rounded-full bg-emerald-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Assistant floating card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="absolute -left-4 sm:-left-10 top-24 w-56 glass-strong rounded-2xl p-4 border-gradient hidden sm:block"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Brain className="size-3.5 text-primary" /> AI Assistant
                  </div>
                  <span className="text-muted-foreground text-xs">×</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-1">Meeting Summary</p>
                <div className="h-8 flex items-end gap-0.5 mb-3">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-primary/30 to-magenta/80"
                      style={{ height: `${30 + Math.sin(i * 0.6) * 35 + Math.random() * 20}%` }}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">Key Points</p>
                <ul className="space-y-1.5 text-[11px]">
                  {[
                    ["bg-emerald-400", "Project roadmap discussed"],
                    ["bg-cyan-400", "Design system updates"],
                    ["bg-emerald-400", "Marketing strategy"],
                    ["bg-magenta", "Q2 goals aligned"],
                  ].map(([c, t]) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${c}`} />
                      <span className="text-foreground/80">{t}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Live transcription floating card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="absolute -right-4 sm:-right-6 bottom-10 w-64 glass-strong rounded-2xl p-4 border-gradient hidden sm:block"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
                    Live Transcription
                  </div>
                  <span className="text-muted-foreground text-xs">×</span>
                </div>
                <div className="h-6 flex items-center gap-0.5 mb-3">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-full bg-primary/60"
                      style={{ height: `${20 + Math.abs(Math.sin(i * 0.5)) * 70}%` }}
                    />
                  ))}
                </div>
                <ul className="space-y-2 text-[11px]">
                  {[
                    ["John", "10:24", "Let's review the new UI flow."],
                    ["Sarah", "10:25", "Looks great! I have one suggestion."],
                    ["Mike", "10:26", "I'll update the prototype."],
                  ].map(([n, t, msg]) => (
                    <li key={n} className="flex gap-2">
                      <div className="size-5 rounded-full bg-gradient-to-br from-primary to-magenta shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-[10px]">
                          {n} <span className="text-muted-foreground font-normal">{t} AM</span>
                        </p>
                        <p className="text-muted-foreground truncate">{msg}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
