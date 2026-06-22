import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectsStore, useTasksStore } from "@/lib/stores";
import { projectService, taskService } from "@/lib/api/services";
import { findUser } from "@/lib/mock";
import { Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/projects/")({ component: Projects });

function Projects() {
  const projects = useProjectsStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    projectService.list().catch(() => toast.error("Unable to load projects."));
    taskService.list().catch(() => toast.error("Unable to load tasks."));
  }, []);

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Coordinate work across teams with AI-powered insights."
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        }
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const openCount = tasks.filter(
            (t) => t.project === p.id && t.status !== "done",
          ).length;
          return (
            <Card
              key={p.id}
              className="p-5 bg-card/60 border-border/60 hover:border-primary/40 transition cursor-pointer"
              onClick={() =>
                navigate({ to: "/app/projects/$id", params: { id: p.id } })
              }
            >
              <div
                className={`h-1 rounded-full bg-gradient-to-r ${p.color} mb-4`}
              />
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {p.description}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span className="text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {p.members.slice(0, 3).map((id) => {
                    const u = findUser(id);
                    return (
                      <Avatar
                        key={id}
                        className="h-7 w-7 ring-2 ring-background"
                      >
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {openCount} open • due {format(new Date(p.due), "MMM d")}
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-secondary/40 p-2 text-xs flex items-start gap-2">
                <Sparkles className="h-3 w-3 text-primary mt-0.5" />
                <span className="text-muted-foreground">
                  AI recommends prioritizing the WebRTC migration this sprint.
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const created = await projectService.create({
                name: String(f.get("name")),
                description: String(f.get("description")),
                progress: Number(f.get("progress")),
                members: ["u1", "u2", "u5"],
                color: "from-violet-500 to-fuchsia-500",
                due: new Date(String(f.get("due"))).toISOString(),
              });
              toast.success("Project created");
              setOpen(false);
              navigate({ to: "/app/projects/$id", params: { id: created.id } });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" required defaultValue="Enterprise Launch" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                name="description"
                required
                defaultValue="Coordinate launch readiness across product, engineering, sales, and success."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Progress</Label>
                <Input
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due date</Label>
                <Input
                  name="due"
                  type="date"
                  defaultValue={new Date(Date.now() + 86400000 * 30)
                    .toISOString()
                    .slice(0, 10)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0"
              >
                Create project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
