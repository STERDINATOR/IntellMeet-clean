import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mic, MicOff, Video, VideoOff, ScreenShare, Hand, Smile, Captions, Circle, PhoneOff, Sparkles, MessageSquare, Users, FileText } from "lucide-react";
import { useMeetingsStore } from "@/lib/stores";
import { findUser, transcriptSample, currentUser } from "@/lib/mock";
import { useState } from "react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/room/$id")({ component: Room });

function Room() {
  const { id } = Route.useParams();
  const meeting = useMeetingsStore((s) => s.meetings.find(m => m.id === id));
  const navigate = useNavigate();
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [share, setShare] = useState(false);
  const [hand, setHand] = useState(false);
  const [caps, setCaps] = useState(true);
  const [rec, setRec] = useState(false);
  const [chat, setChat] = useState<{ user: string; text: string }[]>([{ user: "Aria Chen", text: "Welcome team!" }]);
  const [input, setInput] = useState("");

  const participants = meeting ? [currentUser, ...meeting.participants.filter(p => p !== "me").map(findUser)] : [currentUser];

  const leave = () => { toast.success("You left the meeting"); navigate({ to: "/app/meetings" }); };

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-4rem)] flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <div className="font-semibold">{meeting?.title ?? "Meeting"}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Live • {participants.length} participants {rec && <span className="text-destructive">● Recording</span>}</div>
        </div>
        <Button variant="destructive" onClick={leave}><PhoneOff className="h-4 w-4 mr-2" />Leave</Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 overflow-auto">
          <div className={`grid gap-3 h-full ${participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : participants.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
            {participants.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-card border border-border min-h-[180px] flex items-center justify-center group">
                <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
                {p.id === "me" && !cam ? (
                  <Avatar className="h-24 w-24 ring-4 ring-primary/30"><AvatarImage src={p.avatar} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                ) : (
                  <Avatar className="h-24 w-24 ring-4 ring-primary/30"><AvatarImage src={p.avatar} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium">{p.name}{p.id === "me" && " (You)"}</div>
                  {p.id === "me" && !mic && <div className="h-7 w-7 rounded-md bg-destructive/80 flex items-center justify-center"><MicOff className="h-3 w-3 text-destructive-foreground" /></div>}
                  {i === 1 && <div className="h-2 w-2 rounded-full bg-success animate-pulse" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex w-96 border-l border-border flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="m-3">
              <TabsTrigger value="chat"><MessageSquare className="h-3 w-3 mr-1" />Chat</TabsTrigger>
              <TabsTrigger value="participants"><Users className="h-3 w-3 mr-1" />People</TabsTrigger>
              <TabsTrigger value="transcript"><FileText className="h-3 w-3 mr-1" />Live</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="h-3 w-3 mr-1" />AI</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col px-3 pb-3 m-0 data-[state=inactive]:hidden">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {chat.map((m, i) => (
                  <div key={i} className="rounded-lg bg-secondary/60 p-2">
                    <div className="text-xs font-semibold">{m.user}</div>
                    <div className="text-sm">{m.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); if (!input.trim()) return; setChat(c => [...c, { user: "You", text: input }]); setInput(""); }} className="mt-2 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message…" className="flex-1 bg-secondary/60 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/40" />
                <Button type="submit" size="sm" className="gradient-primary text-primary-foreground border-0">Send</Button>
              </form>
            </TabsContent>
            <TabsContent value="participants" className="px-3 pb-3 space-y-2 overflow-y-auto m-0 data-[state=inactive]:hidden">
              {participants.map(p => <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60"><Avatar className="h-8 w-8"><AvatarImage src={p.avatar} /><AvatarFallback>{p.name[0]}</AvatarFallback></Avatar><div className="flex-1"><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.role}</div></div></div>)}
            </TabsContent>
            <TabsContent value="transcript" className="px-3 pb-3 overflow-y-auto space-y-2 m-0 data-[state=inactive]:hidden">
              {transcriptSample.map((s,i)=><div key={i} className="text-sm"><span className="text-xs text-muted-foreground">{s.t}</span> <span className="font-semibold">{s.speaker}:</span> {s.text}</div>)}
            </TabsContent>
            <TabsContent value="ai" className="px-3 pb-3 space-y-3 overflow-y-auto m-0 data-[state=inactive]:hidden">
              <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 p-3 border border-primary/30">
                <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" />Live insights</div>
                <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                  <li>Decision: lock Q4 roadmap by Friday</li>
                  <li>Action: Noah to ship WebRTC plan</li>
                  <li>Risk: launch slipping by 1 week</li>
                </ul>
              </div>
              <Button className="w-full gradient-primary text-primary-foreground border-0" onClick={() => toast.success("Tasks generated from meeting")}>Generate tasks</Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-4 border-t border-border bg-card/60 backdrop-blur">
        <Ctl active={mic} onClick={() => setMic(!mic)} on={Mic} off={MicOff} label="Mic" />
        <Ctl active={cam} onClick={() => setCam(!cam)} on={Video} off={VideoOff} label="Camera" />
        <Ctl active={share} onClick={() => { setShare(!share); toast.success(share ? "Stopped sharing" : "Started sharing"); }} on={ScreenShare} off={ScreenShare} label="Share" />
        <Ctl active={hand} onClick={() => { setHand(!hand); toast.success(hand ? "Hand lowered" : "Hand raised ✋"); }} on={Hand} off={Hand} label="Hand" />
        <Popover>
          <PopoverTrigger asChild><Button variant="secondary" size="icon" className="h-12 w-12 rounded-full"><Smile className="h-5 w-5" /></Button></PopoverTrigger>
          <PopoverContent className="w-auto p-2"><div className="flex gap-1">{["👍","❤️","😂","🎉","🔥","👏"].map(e => <button key={e} onClick={() => toast.success(`Reacted ${e}`)} className="text-2xl hover:scale-125 transition">{e}</button>)}</div></PopoverContent>
        </Popover>
        <Ctl active={caps} onClick={() => setCaps(!caps)} on={Captions} off={Captions} label="Captions" />
        <Ctl active={rec} danger onClick={() => { setRec(!rec); toast.success(rec ? "Recording stopped" : "Recording started"); }} on={Circle} off={Circle} label="Record" />
      </div>
    </div>
  );
}

function Ctl({ active, onClick, on: On, off: Off, label, danger }: any) {
  return (
    <button onClick={onClick} title={label} className={`h-12 w-12 rounded-full flex items-center justify-center transition ${danger && active ? "bg-destructive text-destructive-foreground" : active ? "gradient-primary text-primary-foreground glow" : "bg-secondary text-foreground hover:bg-secondary/70"}`}>
      {active ? <On className="h-5 w-5" /> : <Off className="h-5 w-5" />}
    </button>
  );
}
