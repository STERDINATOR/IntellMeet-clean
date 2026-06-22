import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Send,
  Search,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskService } from "@/lib/api/services";
import { useMeetingsStore, useTasksStore, useAuthStore } from "@/lib/stores";
import { toast } from "sonner";
import { streamAI } from "@/lib/ai-stream";
import { apiClient } from "@/lib/api/client";

type TaskPriority = "low" | "medium" | "high" | "urgent";

type TranscriptSegment = {
  id?: string;
  atSeconds: number;
  speaker: string;
  text: string;
};

type ActionItem = {
  id?: string;
  _id?: string;
  title: string;
  priority?: string;
};

type Insight = {
  id?: string;
  title: string;
  impact: string;
  severity: "success" | "warning" | "error";
};

type SentimentBreakdown = { speaker: string; sentiment: string };

type SentimentResult = {
  overall: "positive" | "negative" | "neutral";
  score?: number;
  breakdown?: SentimentBreakdown[];
};

type MindmapNode = {
  id: string;
  label: string;
  type: "root" | "topic" | "decision" | "action";
};

export const Route = createFileRoute("/app/ai-assistant")({
  component: AIAssistant,
});

function AIAssistant() {
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Ask me anything about your meetings, projects, or workspace.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");

  const [transcriptResults, setTranscriptResults] = useState<
    TranscriptSegment[]
  >([]);
  const [searchingTranscript, setSearchingTranscript] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");

  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);

  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);

  const [mindmap, setMindmap] = useState<MindmapNode[]>([]);
  const [loadingMindmap, setLoadingMindmap] = useState(false);

  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [loadingQa, setLoadingQa] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const { meetings } = useMeetingsStore();
  const endedMeetings = meetings.filter((m) => m.status === "ended");

  const tasks = useTasksStore((s) => s.tasks);
  const currentUserId = useAuthStore((s) => s.user.id);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, qaAnswer]);

  useEffect(() => {
    if (endedMeetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(endedMeetings[0].id);
    }
  }, [endedMeetings, selectedMeetingId]);

  const searchTranscript = async () => {
    if (!transcriptSearch.trim()) {
      setTranscriptResults([]);
      return;
    }
    setSearchingTranscript(true);
    try {
      const results = await apiClient.post<TranscriptSegment[]>(
        "/ai/transcripts/search",
        {
          query: transcriptSearch,
          ...(selectedMeetingId ? { meetingId: selectedMeetingId } : {}),
        },
      );
      setTranscriptResults(results);
      if (!results.length) toast.info("No transcript segments found.");
    } catch {
      toast.error("Transcript search failed.");
    } finally {
      setSearchingTranscript(false);
    }
  };

  const ask = async (text: string) => {
    if (!text.trim() || loading) return;

    const aiIndex = chat.length + 1;
    setChat((c) => [...c, { role: "user", text }, { role: "ai", text: "" }]);
    setQ("");
    setLoading(true);

    try {
      await streamAI({
        path: "/ai/copilot/stream",
        body: { prompt: text },
        onDelta: (delta) =>
          setChat((c) =>
            c.map((item, i) =>
              i === aiIndex ? { ...item, text: item.text + delta } : item,
            ),
          ),
      });
    } catch {
      setChat((c) =>
        c.map((item, i) =>
          i === aiIndex
            ? {
                ...item,
                text: "AI service unavailable. Check your OpenAI API key.",
              }
            : item,
        ),
      );
      toast.error("AI service unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!selectedMeetingId) return;
    setLoadingSummary(true);
    setSummary("");
    try {
      await streamAI({
        path: `/ai/meetings/${selectedMeetingId}/summary/stream`,
        body: {},
        onDelta: (delta) => setSummary((s) => s + delta),
      });
    } catch {
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadActionItems = async () => {
    if (!selectedMeetingId) return;
    setLoadingActions(true);
    try {
      const items = await apiClient.post<ActionItem[]>(
        `/ai/meetings/${selectedMeetingId}/action-items`,
      );
      setActionItems(items);
      toast.success(
        `${items.length} action items generated and saved as tasks`,
      );
    } catch {
      toast.error("Failed to extract action items.");
    } finally {
      setLoadingActions(false);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await apiClient.post<Insight[]>("/ai/insights/generate");
      setInsights(data);
      toast.success("Workspace insights updated");
    } catch {
      toast.error("Failed to generate insights.");
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadSentiment = async () => {
    if (!selectedMeetingId) return;
    setLoadingSentiment(true);
    try {
      const data = await apiClient.post<SentimentResult>(
        `/ai/meetings/${selectedMeetingId}/sentiment`,
      );
      setSentiment(data);
    } catch {
      toast.error("Failed to analyze sentiment.");
    } finally {
      setLoadingSentiment(false);
    }
  };

  const loadMindmap = async () => {
    if (!selectedMeetingId) return;
    setLoadingMindmap(true);
    try {
      const nodes = await apiClient.post<MindmapNode[]>(
        `/ai/meetings/${selectedMeetingId}/mindmap`,
      );
      setMindmap(nodes);
    } catch {
      toast.error("Failed to generate mind map.");
    } finally {
      setLoadingMindmap(false);
    }
  };

  const askQA = async () => {
    if (!qaQuestion.trim() || !selectedMeetingId) return;
    setLoadingQa(true);
    setQaAnswer("");
    try {
      await streamAI({
        path: "/ai/transcript/qa/stream",
        body: { question: qaQuestion, meetingId: selectedMeetingId },
        onDelta: (delta) => setQaAnswer((s) => s + delta),
      });
    } catch {
      toast.error("Failed to answer question.");
    } finally {
      setLoadingQa(false);
    }
  };

  const severityIcon = (s: Insight["severity"]) => {
    if (s === "success") return <TrendingUp className="h-4 w-4 text-success" />;
    if (s === "error")
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    return <Sparkles className="h-4 w-4 text-warning" />;
  };

  const MeetingSelector = () => (
    <Select value={selectedMeetingId} onValueChange={setSelectedMeetingId}>
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Select a meeting" />
      </SelectTrigger>
      <SelectContent>
        {endedMeetings.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.title}
          </SelectItem>
        ))}
        {endedMeetings.length === 0 && (
          <SelectItem value="demo">Demo meeting</SelectItem>
        )}
      </SelectContent>
    </Select>
  );

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        subtitle="Search, summarize, and reason across your entire workspace."
      />
      <Tabs defaultValue="summary">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="mindmap">Mind Map</TabsTrigger>
          <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
        </TabsList>

        {/* Summary */}
        <TabsContent value="summary" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Meeting Summary
              </div>
              <MeetingSelector />
              <Button
                onClick={loadSummary}
                disabled={loadingSummary || !selectedMeetingId}
                className="gradient-primary text-primary-foreground border-0"
                size="sm"
              >
                {loadingSummary ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Generate
              </Button>
            </div>
            {summary ? (
              <div className="rounded-xl bg-secondary/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <div className="rounded-xl bg-secondary/40 p-4 text-sm text-muted-foreground">
                Select a meeting and click Generate to produce an AI summary.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {["roadmap", "Q4", "AI", "launch", "design"].map((t) => (
                <Badge key={t} variant="outline">
                  #{t}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Transcript Search */}
        <TabsContent value="transcript" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60">
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchTranscript()}
                  placeholder="Search transcripts…"
                  className="pl-9 bg-secondary/60"
                />
              </div>
              <MeetingSelector />
              <Button
                onClick={searchTranscript}
                disabled={searchingTranscript || !transcriptSearch.trim()}
                size="sm"
                className="gradient-primary text-primary-foreground border-0"
              >
                {searchingTranscript ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {transcriptResults.length > 0 ? (
                transcriptResults.map((s, i) => (
                  <div key={s.id ?? i} className="flex gap-3">
                    <div className="text-xs text-muted-foreground w-12 pt-1 shrink-0">
                      {s.atSeconds != null ? `${s.atSeconds}s` : "—"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.speaker}</div>
                      <div className="text-sm text-muted-foreground">
                        {s.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  {transcriptSearch.trim()
                    ? "No results found."
                    : "Enter a search query and press Enter or click the search button."}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Action Items */}
        <TabsContent value="actions" className="mt-4 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <MeetingSelector />
            <Button
              onClick={loadActionItems}
              disabled={loadingActions || !selectedMeetingId}
              className="gradient-primary text-primary-foreground border-0"
              size="sm"
            >
              {loadingActions ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Extract Action Items
            </Button>
          </div>
          {actionItems.length > 0 ? (
            actionItems.map((item, i) => (
              <Card
                key={String(item._id ?? item.id ?? i)}
                className="p-4 bg-card/60 border-border/60 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {item.priority}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await taskService.create({
                      title: item.title,
                      description: "AI-extracted action item",
                      status: "todo",
                      priority: (item.priority as TaskPriority) ?? "high",
                      assignee: currentUserId,
                      due: new Date(Date.now() + 86400000 * 3).toISOString(),
                      project: "",
                      aiScore: 92,
                      tags: ["ai", "action-item"],
                    });
                    toast.success("Task saved");
                  }}
                >
                  Save Task
                </Button>
              </Card>
            ))
          ) : (
            <Card className="p-8 bg-card/60 border-border/60 text-center text-sm text-muted-foreground">
              Select a meeting and click "Extract Action Items" to generate
              tasks.
            </Card>
          )}
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button
              onClick={loadInsights}
              disabled={loadingInsights}
              size="sm"
              className="gradient-primary text-primary-foreground border-0"
            >
              {loadingInsights ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh Insights
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {(insights.length > 0
              ? insights
              : [
                  {
                    id: "i1",
                    title: "23% of time spent on status updates",
                    impact: "Consider async standups",
                    severity: "warning" as const,
                  },
                  {
                    id: "i2",
                    title: "Decision velocity improved 31% this month",
                    impact: "Keep the new agenda template",
                    severity: "success" as const,
                  },
                  {
                    id: "i3",
                    title: `${tasks.filter((t) => t.priority === "urgent").length} urgent tasks need attention`,
                    impact: "Review and assign owners",
                    severity: "error" as const,
                  },
                  {
                    id: "i4",
                    title: "Cross-team meetings down 12%",
                    impact: "Consider dedicated syncs",
                    severity: "warning" as const,
                  },
                ]
            ).map((ins) => (
              <Card key={ins.id} className="p-5 bg-card/60 border-border/60">
                <div className="flex items-center gap-2">
                  {severityIcon(ins.severity)}
                  <div className="font-semibold text-sm">{ins.title}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {ins.impact}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sentiment */}
        <TabsContent value="sentiment" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Sentiment Analysis
              </div>
              <MeetingSelector />
              <Button
                onClick={loadSentiment}
                disabled={loadingSentiment || !selectedMeetingId}
                size="sm"
                className="gradient-primary text-primary-foreground border-0"
              >
                {loadingSentiment ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Analyze
              </Button>
            </div>

            {sentiment ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      sentiment.overall === "positive"
                        ? "default"
                        : sentiment.overall === "negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize"
                  >
                    {sentiment.overall}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {Math.round((sentiment.score ?? 0.5) * 100)}%
                  </span>
                </div>

                {(sentiment.breakdown ?? []).map((b, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm bg-secondary/40 rounded-lg px-3 py-2"
                  >
                    <span>{b.speaker}</span>
                    <Badge variant="outline" className="capitalize">
                      {b.sentiment}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a meeting and click Analyze.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Mind Map */}
        <TabsContent value="mindmap" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 min-h-[400px]">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Mind Map
              </div>
              <MeetingSelector />
              <Button
                onClick={loadMindmap}
                disabled={loadingMindmap || !selectedMeetingId}
                size="sm"
                className="gradient-primary text-primary-foreground border-0"
              >
                {loadingMindmap ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Generate
              </Button>
            </div>

            {mindmap.length > 0 ? (
              <div className="flex flex-wrap gap-3 items-start">
                {mindmap.map((node) => (
                  <div
                    key={node.id}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium border ${
                      node.type === "root"
                        ? "gradient-primary text-primary-foreground border-0 glow"
                        : node.type === "action"
                          ? "border-accent/50 bg-accent/10 text-accent"
                          : node.type === "decision"
                            ? "border-success/50 bg-success/10 text-success"
                            : "border-border bg-secondary/60"
                    }`}
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
                Select a meeting and click Generate.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Q&A */}
        <TabsContent value="qa" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 flex flex-col h-[560px]">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Copilot Q&amp;A
              </div>
              <MeetingSelector />
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : ""}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {m.text ||
                      (loading && i === chat.length - 1 ? "Thinking…" : "")}
                  </div>
                </div>
              ))}

              {qaAnswer && (
                <div className="flex">
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-accent/20 whitespace-pre-wrap border border-accent/30">
                    {qaAnswer}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex gap-2">
                <Input
                  value={qaQuestion}
                  onChange={(e) => setQaQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askQA()}
                  placeholder="Ask about this meeting transcript…"
                  className="bg-secondary/60"
                />
                <Button
                  onClick={askQA}
                  disabled={loadingQa || !qaQuestion.trim()}
                  className="gradient-primary text-primary-foreground border-0"
                >
                  {loadingQa ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(q);
                }}
                className="flex gap-2"
              >
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ask Copilot anything about your workspace…"
                  className="bg-secondary/60"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="gradient-primary text-primary-foreground border-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
