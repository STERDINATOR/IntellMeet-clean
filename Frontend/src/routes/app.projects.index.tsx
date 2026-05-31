import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProjectsStore, useTasksStore } from "@/lib/stores";
import { findUser } from "@/lib/mock";
import { Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/projects/")({ component: Projects });

function Projects() {
  const { projects } = useProjectsStore();
  const tasks = useTasksStore((s)=>s.tasks);
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader title="Projects" subtitle="Coordinate work across teams with AI-powered insights." actions={<Button className="gradient-primary text-primary-foreground border-0" onClick={() => toast.success("New project created")}><Plus className="h-4 w-4 mr-2" />New Project</Button>} />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const open = tasks.filter(t => t.project === p.id && t.status !== "done").length;
          return (
            <Card key={p.id} className="p-5 bg-card/60 border-border/60 hover:border-primary/40 transition cursor-pointer" onClick={() => navigate({ to: "/app/projects/$id", params: { id: p.id } })}>
              <div className={`h-1 rounded-full bg-gradient-to-r ${p.color} mb-4`} />
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{p.description}</div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1"><span>Progress</span><span className="text-muted-foreground">{p.progress}%</span></div>
                <Progress value={p.progress} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">{p.members.slice(0,3).map(id => { const u = findUser(id); return <Avatar key={id} className="h-7 w-7 ring-2 ring-background"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>; })}</div>
                <div className="text-xs text-muted-foreground">{open} open • due {format(new Date(p.due),"MMM d")}</div>
              </div>
              <div className="mt-3 rounded-lg bg-secondary/40 p-2 text-xs flex items-start gap-2"><Sparkles className="h-3 w-3 text-primary mt-0.5" /><span className="text-muted-foreground">AI recommends prioritizing the WebRTC migration this sprint.</span></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
