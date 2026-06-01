import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectService, taskService } from "@/lib/api/services";
import { useProjectsStore, useTasksStore } from "@/lib/stores";
import { findUser, users } from "@/lib/mock";
import { Sparkles } from "lucide-react";
import type { Task } from "@/lib/mock";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/projects/$id")({ component: ProjectDetail });

const cols: { key: Task["status"]; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
];

function ProjectDetail() {
  const { id } = Route.useParams();
  const project = useProjectsStore((s) => s.projects.find(p => p.id === id));
  const updateProject = useProjectsStore((s) => s.update);
  const { tasks, setStatus } = useTasksStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [memberId, setMemberId] = useState("u1");
  const [remoteProject, setRemoteProject] = useState<typeof project | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      setLoading(true);
      projectService.get(id)
        .then((remote) => remote && setRemoteProject(remote as any))
        .catch(() => toast.error("Unable to load project details."))
        .finally(() => setLoading(false));
    }
    taskService.list().catch(() => toast.error("Unable to load tasks."));
  }, [id, project]);

  const currentProject = project ?? remoteProject;
  if (!currentProject) return <div className="text-muted-foreground">Project not found.</div>;
  const projectTasks = tasks.filter(t => t.project === id);

  return (
    <div>
      <PageHeader title={currentProject.name} subtitle={currentProject.description} actions={<Button variant="outline" onClick={() => setInviteOpen(true)}>Invite</Button>} />

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-5 bg-card/60 border-border/60 lg:col-span-3">
          <div className="flex justify-between text-sm mb-2"><span className="font-semibold">Project progress</span><span>{currentProject.progress}%</span></div>
          <Progress value={currentProject.progress} />
          <div className="mt-4 flex items-center gap-3"><div className="flex -space-x-2">{currentProject.members.map(id => { const u = findUser(id); return <Avatar key={id} className="h-8 w-8 ring-2 ring-background"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>; })}</div><div className="text-sm text-muted-foreground">{currentProject.members.length} members</div></div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-gradient-glow" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" /><div className="text-sm font-semibold">AI recommendations</div></div>
            <p className="text-xs text-muted-foreground">Move 2 tasks to review this week. 1 blocker detected on owner reassignment.</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {cols.map(col => (
          <div key={col.key} className="rounded-2xl bg-secondary/40 p-3 min-h-[400px]">
            <div className="flex items-center justify-between px-2 mb-3">
              <div className="text-sm font-semibold">{col.label}</div>
              <Badge variant="secondary">{projectTasks.filter(t=>t.status===col.key).length}</Badge>
            </div>
            <div className="space-y-2">
              {projectTasks.filter(t=>t.status===col.key).map(t => {
                const u = findUser(t.assignee);
                return (
                  <Card key={t.id} className="p-3 bg-card/80 border-border/60 cursor-grab hover:border-primary/40 transition">
                    <div className="text-sm font-medium line-clamp-2">{t.title}</div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                      <Avatar className="h-6 w-6"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {cols.filter(c=>c.key!==t.status).map(c => (
                        <button key={c.key} onClick={async () => {
                      await taskService.update(t.id, { status: c.key });
                      setStatus(t.id, c.key);
                    }} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition">→{c.label}</button>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite project member</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Select a teammate to add to this project.</div>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground border-0" onClick={async () => {
              const members = Array.from(new Set([...currentProject.members, memberId]));
              const updated = await projectService.update(currentProject.id, { members });
              updateProject(currentProject.id, { members });
              setRemoteProject(updated as typeof remoteProject);
              toast.success("Member added to project");
              setInviteOpen(false);
            }}>Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
