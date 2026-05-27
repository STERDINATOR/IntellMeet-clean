import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, Users, PhoneOff,
  Brain, Sparkles, Send, X,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/meeting")({
  head: () => ({ meta: [{ title: "Meeting — IntellMeet" }] }),
  component: MeetingRoom,
});

const participants = [
  { name: "Alex Morgan", speaking: true },
  { name: "Sarah Chen", speaking: false },
  { name: "Mike Johnson", speaking: false },
  { name: "Lena Park", speaking: false },
  { name: "David Kim", speaking: false },
  { name: "Emily Rose", speaking: false },
];

const transcript = [
  { who: "Alex", time: "10:24", text: "Let's review the new UI flow for the dashboard." },
  { who: "Sarah", time: "10:25", text: "Looks great! I have one suggestion about the spacing." },
  { who: "Mike", time: "10:26", text: "I'll update the prototype after this call." },
  { who: "Alex", time: "10:27", text: "Perfect. Let's move on to the roadmap." },
];

export function MeetingRoom() {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <main className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="size-8 rounded-lg bg-[var(--gradient-primary)] grid place-items-center">
            <Sparkles className="size-4 text-white" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold">Team Standup</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
              Live · 01:24:35
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {participants.slice(0, 4).map((p, i) => (
            <div key={i} className="size-7 rounded-full ring-2 ring-background bg-gradient-to-br from-primary to-magenta" />
          ))}
          <div className="size-7 rounded-full ring-2 ring-background glass grid place-items-center text-[10px]">+3</div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Stage */}
        <div className="flex-1 p-4 grid grid-rows-[1fr_auto] gap-4 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
            {participants.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`relative aspect-video rounded-2xl overflow-hidden glass-strong ${
                  p.speaking ? "ring-2 ring-primary glow-primary" : ""
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent via-muted to-secondary" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="size-16 rounded-full bg-gradient-to-br from-primary to-magenta grid place-items-center font-display text-xl text-white font-semibold">
                    {p.name[0]}
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 glass-strong rounded-md px-2 py-1 text-xs flex items-center gap-1.5">
                  {p.speaking ? <Mic className="size-3 text-primary" /> : <MicOff className="size-3 text-muted-foreground" />}
                  {p.name}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <div className="glass-strong border-gradient rounded-2xl p-2 flex items-center gap-1.5">
              <ControlBtn active={!muted} onClick={() => setMuted(!muted)} icon={muted ? MicOff : Mic} />
              <ControlBtn active={!camOff} onClick={() => setCamOff(!camOff)} icon={camOff ? VideoOff : Video} />
              <ControlBtn icon={Monitor} />
              <ControlBtn icon={Users} />
              <ControlBtn icon={MessageSquare} onClick={() => setChatOpen(!chatOpen)} active={chatOpen} />
              <ControlBtn icon={Brain} />
              <Link to="/dashboard" className="size-11 rounded-xl bg-destructive grid place-items-center hover:scale-105 transition-transform ml-1">
                <PhoneOff className="size-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Side panel */}
        {chatOpen && (
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-80 border-l border-white/5 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="size-4 text-primary" /> AI Live Transcription
              </div>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <div className="h-12 px-4 flex items-end gap-0.5 border-b border-white/5">
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-full bg-primary/60"
                  style={{ height: `${20 + Math.abs(Math.sin(i * 0.4)) * 70}%` }}
                />
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-2.5"
                >
                  <div className="size-7 rounded-full bg-gradient-to-br from-primary to-magenta shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="font-medium">{t.who}</span>
                      <span className="text-muted-foreground"> · {t.time}</span>
                    </p>
                    <p className="text-sm text-foreground/80">{t.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="glass rounded-xl flex items-center gap-2 px-3 py-2">
                <input placeholder="Send a message..." className="flex-1 bg-transparent text-sm outline-none" />
                <button className="size-7 rounded-lg bg-[var(--gradient-primary)] grid place-items-center">
                  <Send className="size-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </div>
    </main>
  );
}

function ControlBtn({ icon: Icon, active = false, onClick }: { icon: any; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`size-11 rounded-xl grid place-items-center transition-all ${
        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
    </button>
  );
}
