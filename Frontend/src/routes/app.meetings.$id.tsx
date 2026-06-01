import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMeetingsStore } from "@/lib/stores";
import { meetingService } from "@/lib/api/services";
import { findUser, transcriptSample } from "@/lib/mock";
import { format } from "date-fns";
import { Download, Share2, Sparkles, CheckCircle2, FileText, Video } from "lucide-react";
import { toast } from "sonner";
import { buildMeetingLink, copyText, downloadText, meetingExport } from "@/lib/workflows";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/meetings/$id")({ component: MeetingDetail });

function MeetingDetail() {
  const { id } = Route.useParams();
  const meeting = useMeetingsStore((s) => s.meetings.find(m => m.id === id));
  const navigate = useNavigate();
  const [remoteMeeting, setRemoteMeeting] = useState<typeof meeting | null>(null);

  useEffect(() => {
    if (!meeting) {
      meetingService.get(id).then((remote) => {
        if (remote) setRemoteMeeting(remote as any);
      }).catch(() => toast.error("Unable to load meeting details."));
    }
  }, [id, meeting]);

  const currentMeeting = meeting ?? remoteMeeting;
  if (!currentMeeting) return <div className="text-muted-foreground">Meeting not found.</div>;

  return (
    <div>
      <PageHeader
        title={currentMeeting.title}
        subtitle={`${format(new Date(currentMeeting.start), "EEEE, MMM d • HH:mm")} • ${currentMeeting.duration} min`}
        actions={
          <>
            <Button variant="outline" onClick={async () => { await copyText(buildMeetingLink(currentMeeting.id)); toast.success("Meeting link copied"); }}><Share2 className="h-4 w-4 mr-2" />Share</Button>
            <Button variant="outline" onClick={() => { downloadText(`${currentMeeting.title.toLowerCase().replace(/\W+/g, "-")}-summary.md`, meetingExport(currentMeeting), "text/markdown;charset=utf-8"); toast.success("Summary downloaded"); }}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
            {currentMeeting.status !== "ended" && <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate({ to: "/app/room/$id", params: { id } })}><Video className="h-4 w-4 mr-2" />Join</Button>}
          </>
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6 bg-card/60 border-border/60">
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="actions">Action items</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4 space-y-4">
              <div className="rounded-xl bg-secondary/40 p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><div className="text-sm font-semibold">AI Summary</div><Badge variant="secondary">94% confidence</Badge></div>
                <p className="text-sm leading-relaxed">The team aligned on the Q4 roadmap, prioritizing the WebRTC SFU migration and the Aurora v2 design system rollout. Sophia will own the AI eval dashboard. Marketing launch was pushed by 1 week to align with the product GA date.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[{l:"Decisions",v:5,c:"text-success"},{l:"Action items",v:4,c:"text-accent"},{l:"Risks",v:1,c:"text-warning"}].map(s=>(
                  <div key={s.l} className="rounded-xl bg-secondary/40 p-4">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className={`text-3xl font-bold mt-1 ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold text-sm mb-2">Smart tags</div>
                <div className="flex flex-wrap gap-2">{["roadmap","Q4","WebRTC","Aurora","launch","AI"].map(t => <Badge key={t} variant="outline">#{t}</Badge>)}</div>
              </div>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
              {transcriptSample.map((s,i) => (
                <div key={i} className="flex gap-3">
                  <div className="text-xs text-muted-foreground w-12 pt-1">{s.t}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{s.speaker}</div>
                    <div className="text-sm text-muted-foreground">{s.text}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="actions" className="mt-4 space-y-2">
              {["Noah — ship WebRTC SFU migration plan (Fri)","Maya — finalize Aurora v2 audit (Wed)","Sophia — draft AI eval dashboard (Wed)","Liam — push launch by 1 week"].map((t,i)=>(
                <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div className="text-sm">{t}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="timeline" className="mt-4 space-y-3">
              {transcriptSample.slice(0,5).map((s,i)=>(
                <div key={i} className="flex gap-3"><div className="text-xs w-12 text-primary">{s.t}</div><div className="text-sm">{s.text}</div></div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Participants</div>
            <div className="space-y-2">
              {currentMeeting.participants.map(id => {
                const u = findUser(id);
                return <div key={id} className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar><div className="text-sm"><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.role}</div></div></div>;
              })}
            </div>
          </Card>
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Metrics</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Score</span><span className="font-semibold">{currentMeeting.score || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sentiment</span><span className="font-semibold text-success">Positive</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Talk balance</span><span>74%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Recordings</span><span>1 file</span></div>
            </div>
          </Card>
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Files</div>
            <div className="space-y-2">
              {["roadmap-q4.pdf","aurora-tokens.fig","ai-eval.csv"].map(f=><div key={f} className="flex items-center gap-2 text-sm hover:bg-secondary/60 rounded p-2 cursor-pointer"><FileText className="h-4 w-4 text-muted-foreground" />{f}</div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
