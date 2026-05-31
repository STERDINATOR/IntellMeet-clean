import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Search } from "lucide-react";
import { transcriptSample } from "@/lib/mock";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/ai-assistant")({ component: AIAssistant });

function AIAssistant() {
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ role: "user"|"ai"; text: string }[]>([
    { role: "ai", text: "Ask me anything about your meetings, projects, or workspace." },
  ]);
  const ask = (text: string) => {
    if (!text.trim()) return;
    setChat(c => [...c, { role: "user", text }]);
    setTimeout(() => setChat(c => [...c, { role: "ai", text: `Based on your last 10 meetings: ${text} → 3 highlights and 2 action items found. Want details?` }]), 600);
    setQ("");
  };

  return (
    <div>
      <PageHeader title="AI Assistant" subtitle="Search, summarize, and reason across your entire workspace." />
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><div className="font-semibold">Workspace summary</div><Badge variant="secondary">94% confidence</Badge></div>
            <p className="mt-3 text-sm leading-relaxed">Your team had 24 meetings this week, generated 87 action items, and shipped 3 major decisions. Sentiment is positive (+12 vs last week). Top risk: WebRTC SFU migration timeline.</p>
            <div className="flex flex-wrap gap-2 mt-4">{["roadmap","Q4","AI","launch","design"].map(t=><Badge key={t} variant="outline">#{t}</Badge>)}</div>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search across all transcripts…" className="pl-9 bg-secondary/60" /></div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {transcriptSample.map((s,i)=>(<div key={i} className="flex gap-3"><div className="text-xs text-muted-foreground w-12 pt-1">{s.t}</div><div className="flex-1"><div className="text-sm font-semibold">{s.speaker}</div><div className="text-sm text-muted-foreground">{s.text}</div></div></div>))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-4 space-y-2">
          {["Noah — WebRTC SFU plan","Maya — Aurora v2 audit","Sophia — AI eval dashboard","Liam — Launch slip plan"].map((t,i)=><Card key={i} className="p-4 bg-card/60 border-border/60 flex items-center justify-between"><div>{t}</div><Button size="sm" variant="outline">Assign</Button></Card>)}
        </TabsContent>

        <TabsContent value="insights" className="mt-4 grid md:grid-cols-2 gap-3">
          {["23% of time spent on status updates","Decision velocity up 31%","Cross-team meetings down 12%","Top-quality meeting: Design Critique"].map((s,i)=><Card key={i} className="p-5 bg-card/60 border-border/60"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><div className="font-semibold text-sm">Insight #{i+1}</div></div><div className="text-sm mt-2">{s}</div></Card>)}
        </TabsContent>

        <TabsContent value="mindmap" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 min-h-[400px] flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl opacity-50" style={{background:"var(--gradient-primary)"}} />
              <div className="relative grid grid-cols-3 gap-6 items-center text-center">
                {["Roadmap","Risks","Decisions","Q4 Strategy","Owners","Launch","Eval"].map((n,i) => (
                  <div key={n} className={`rounded-2xl p-4 glass ${i===3?"col-span-1 gradient-primary text-primary-foreground glow":""}`}>{n}</div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="qa" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-3">
              {chat.map((m,i)=>(<div key={i} className={`flex ${m.role==="user"?"justify-end":""}`}><div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role==="user"?"bg-primary text-primary-foreground":"bg-secondary"}`}>{m.text}</div></div>))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="mt-3 flex gap-2">
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Ask anything about your workspace…" />
              <Button type="submit" className="gradient-primary text-primary-foreground border-0"><Send className="h-4 w-4" /></Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
