import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMeetingsStore, useTasksStore } from "@/lib/stores";
import {
  meetingService,
  aiService,
  transcriptService,
  userService,
} from "@/lib/api/services";
import { format } from "date-fns";
import {
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  FileText,
  Video,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  buildMeetingLink,
  copyText,
  downloadText,
  meetingExport,
} from "@/lib/workflows";
import { useEffect, useState } from "react";
import { streamAI } from "@/lib/ai-stream";

export const Route = createFileRoute("/app/meetings/$id")({
  component: MeetingDetail,
});

// ── SummaryTab ────────────────────────────────────────────────────────────────
function SummaryTab({
  meetingId,
  meetingTitle,
}: {
  meetingId: string;
  meetingTitle: string;
}) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSummary("");
    try {
      await streamAI({
        path: `/ai/meetings/${meetingId}/summary/stream`,
        body: {},
        onDelta: (d) => setSummary((s) => s + d),
      });
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-secondary/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">AI Summary</div>
          <Badge variant="secondary">Powered by AI</Badge>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={generate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          {summary ? "Regenerate" : "Generate"}
        </Button>
      </div>
      {summary ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Click Generate to produce an AI summary for "{meetingTitle}".
        </p>
      )}
    </div>
  );
}

// ── TranscriptTab ─────────────────────────────────────────────────────────────
function TranscriptTab({ meetingId }: { meetingId: string }) {
  type TranscriptLine = {
    _id?: string | number;
    speaker: string;
    text: string;
    atSeconds: number;
  };
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transcriptService
      .list(meetingId)
      .then(
        (
          data: Array<{
            _id?: string | number;
            speaker: string;
            text: string;
            atSeconds: number;
          }>,
        ) => setLines(data.length ? data : []),
      )
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <>
      {lines.map((s, i) => (
        <div key={s._id ?? i} className="flex gap-3">
          <div className="text-xs text-muted-foreground w-16 pt-1 shrink-0">
            {s.atSeconds != null ? `${s.atSeconds}s` : ""}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{s.speaker}</div>
            <div className="text-sm text-muted-foreground">{s.text}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// ── ActionsTab ────────────────────────────────────────────────────────────────
function ActionsTab({ meetingId }: { meetingId: string }) {
  const tasks = useTasksStore((s) => s.tasks);
  type MeetingTaskLike = { meetingId?: string; source?: string };
  const meetingTasks = tasks.filter((t) => {
    const mt = t as unknown as MeetingTaskLike;
    return mt.meetingId === meetingId || mt.source === meetingId;
  });
  const [extracting, setExtracting] = useState(false);

  const extract = async () => {
    setExtracting(true);
    try {
      await aiService.extractActionItems(meetingId);
      toast.success("Action items extracted and saved");
    } catch {
      toast.error("Extraction failed — ensure meeting has a transcript.");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={extract}
          disabled={extracting}
        >
          {extracting ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          Extract AI actions
        </Button>
      </div>
      {meetingTasks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No action items yet. Click Extract to generate from transcript.
        </p>
      )}
      {meetingTasks.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3"
        >
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          <div className="flex-1 text-sm">{t.title}</div>
          <Badge variant="outline">{t.priority}</Badge>
        </div>
      ))}
    </div>
  );
}

// ── MeetingDetail ─────────────────────────────────────────────────────────────
function MeetingDetail() {
  const { id } = Route.useParams();
  const meeting = useMeetingsStore((s) => s.meetings.find((m) => m.id === id));
  const navigate = useNavigate();
  const [remoteMeeting, setRemoteMeeting] = useState<typeof meeting | null>(
    null,
  );
  const [teamUsers, setTeamUsers] = useState<
    Array<{ id: string; name: string; avatar?: string; role?: string }>
  >([]);

  useEffect(() => {
    if (!meeting) {
      meetingService
        .get(id)
        .then((remote) => {
          if (remote) setRemoteMeeting(remote);
        })
        .catch(() => toast.error("Unable to load meeting details."));
    }

    userService
      .list()
      .then((data) => {
        const normalized = (data as unknown[])
          .map(
            (u) =>
              u as {
                id?: string;
                _id?: string;
                name?: string;
                avatar?: string;
                role?: string;
              },
          )
          .filter(
            (u) =>
              typeof u?.name === "string" &&
              typeof (u.id ?? u._id) === "string",
          )
          .map((u) => ({
            id: u.id ?? u._id!,
            name: u.name!,
            avatar: u.avatar,
            role: u.role,
          }));
        setTeamUsers(normalized);
      })
      .catch(() => undefined);
  }, [id, meeting]);

  const currentMeeting = meeting ?? remoteMeeting;
  if (!currentMeeting)
    return <div className="text-muted-foreground">Meeting not found.</div>;

  const getUser = (userId: string) =>
    teamUsers.find((u) => u.id === userId) ?? {
      id: userId,
      name: "Unknown",
      avatar: "",
      role: "",
    };

  return (
    <div>
      <PageHeader
        title={currentMeeting.title}
        subtitle={`${format(new Date(currentMeeting.start), "EEEE, MMM d • HH:mm")} • ${currentMeeting.duration} min`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                await copyText(buildMeetingLink(currentMeeting.id));
                toast.success("Meeting link copied");
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                downloadText(
                  `${currentMeeting.title.toLowerCase().replace(/\W+/g, "-")}-summary.md`,
                  meetingExport(currentMeeting),
                  "text/markdown;charset=utf-8",
                );
                toast.success("Summary downloaded");
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            {currentMeeting.status !== "ended" && (
              <Button
                className="gradient-primary text-primary-foreground border-0"
                onClick={() =>
                  navigate({ to: "/app/room/$id", params: { id } })
                }
              >
                <Video className="h-4 w-4 mr-2" />
                Join
              </Button>
            )}
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
              <SummaryTab meetingId={id} meetingTitle={currentMeeting.title} />
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { l: "Decisions", v: 5, c: "text-success" },
                  { l: "Action items", v: 4, c: "text-accent" },
                  { l: "Risks", v: 1, c: "text-warning" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-secondary/40 p-4">
                    <div className="text-xs text-muted-foreground">{s.l}</div>
                    <div className={`text-3xl font-bold mt-1 ${s.c}`}>
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="font-semibold text-sm mb-2">Smart tags</div>
                <div className="flex flex-wrap gap-2">
                  {["roadmap", "Q4", "WebRTC", "Aurora", "launch", "AI"].map(
                    (t) => (
                      <Badge key={t} variant="outline">
                        #{t}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent
              value="transcript"
              className="mt-4 space-y-3 max-h-[500px] overflow-y-auto"
            >
              <TranscriptTab meetingId={id} />
            </TabsContent>
            <TabsContent value="actions" className="mt-4">
              <ActionsTab meetingId={id} />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Timeline view coming soon.
              </p>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-4">
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Participants</div>
            <div className="space-y-2">
              {currentMeeting.participants.map((pid) => {
                const u = getUser(pid);
                return (
                  <div key={pid} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {u.role}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Metrics</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score</span>
                <span className="font-semibold">
                  {currentMeeting.score || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sentiment</span>
                <span className="font-semibold text-success">Positive</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Talk balance</span>
                <span>74%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recordings</span>
                <span>1 file</span>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="font-semibold mb-3">Files</div>
            <div className="space-y-2">
              {["roadmap-q4.pdf", "aurora-tokens.fig", "ai-eval.csv"].map(
                (f) => (
                  <div
                    key={f}
                    className="flex items-center gap-2 text-sm hover:bg-secondary/60 rounded p-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {f}
                  </div>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
