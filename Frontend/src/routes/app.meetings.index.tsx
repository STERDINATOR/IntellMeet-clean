import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Plus, Search, Video, Zap } from "lucide-react";
import { useMeetingsStore } from "@/lib/stores";
import { findUser } from "@/lib/mock";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/meetings/")({ component: Meetings });

function Meetings() {
  const { meetings, add } = useMeetingsStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "ended">("all");
  const list = meetings.filter(m => (filter === "all" || m.status === filter) && m.title.toLowerCase().includes(q.toLowerCase()));

  const instant = () => {
    const id = add({ title: "Instant Meeting", start: new Date().toISOString(), duration: 30, status: "live", participants: ["me"], host: "me", type: "Team" });
    toast.success("Meeting started"); navigate({ to: "/app/room/$id", params: { id } });
  };

  return (
    <div>
      <PageHeader
        title="Meetings"
        subtitle="Schedule, join, and review your meetings."
        actions={
          <>
            <Button variant="outline" onClick={instant}><Zap className="h-4 w-4 mr-2" />Instant</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={() => navigate({ to: "/app/meetings/new" })}><Plus className="h-4 w-4 mr-2" />Schedule</Button>
          </>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ended">Past</TabsTrigger>
          </TabsList>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meetings…" className="pl-9 bg-secondary/60" />
          </div>
        </div>

        <TabsContent value={filter}>
          <div className="grid lg:grid-cols-2 gap-4">
            {list.map((m) => (
              <Card key={m.id} className="p-5 bg-card/60 border-border/60 hover:border-primary/40 transition group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={m.status === "live" ? "default" : "secondary"} className={m.status === "live" ? "gradient-primary text-primary-foreground border-0" : ""}>
                        {m.status === "live" ? "● Live" : m.status}
                      </Badge>
                      <Badge variant="outline">{m.type}</Badge>
                    </div>
                    <div className="font-semibold mt-2 truncate">{m.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{format(new Date(m.start), "EEE, MMM d • HH:mm")} • {m.duration}min</div>
                    {m.agenda && <div className="text-sm text-muted-foreground mt-3 line-clamp-2">{m.agenda}</div>}
                  </div>
                  <div className="text-2xl font-bold text-primary opacity-60 group-hover:opacity-100">{m.score || "—"}</div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex -space-x-2">
                    {m.participants.slice(0,4).map((id) => { const u = findUser(id); return <Avatar key={id} className="h-7 w-7 ring-2 ring-background"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>; })}
                    {m.participants.length > 4 && <div className="h-7 w-7 rounded-full bg-secondary ring-2 ring-background flex items-center justify-center text-xs">+{m.participants.length - 4}</div>}
                  </div>
                  <div className="flex gap-2">
                    {m.status !== "ended" && <Button size="sm" className="gradient-primary text-primary-foreground border-0" onClick={() => navigate({ to: "/app/room/$id", params: { id: m.id } })}><Video className="h-3 w-3 mr-1" />Join</Button>}
                    <Link to="/app/meetings/$id" params={{ id: m.id }}><Button size="sm" variant="outline">Details</Button></Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
