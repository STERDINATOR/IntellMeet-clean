import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Sparkles, Trash2 } from "lucide-react";
import { useProjectsStore, useTasksStore } from "@/lib/stores";
import { taskService, projectService, userService } from "@/lib/api/services";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/api/domain";
import { toast } from "sonner";

export const Route = createFileRoute("/app_tasks")({ component: Tasks });

type ApiUser = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  department?: string;
  online?: boolean;
};

function normalizeUser(u: ApiUser): {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  department?: string;
  online?: boolean;
} {
  const id = u.id ?? u._id ?? "";
  return {
    ...u,
    id,
    name: u.name,
    email: u.email ?? "",
    avatar:
      u.avatar ??
      `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(u.name)}`,
    department: u.department ?? "General",
    online: u.online ?? false,
  };
}

function Tasks() {
  const { tasks, setStatus } = useTasksStore();
  const projects = useProjectsStore((s) => s.projects);
  const [q, setQ] = useState("");
  const [pri, setPri] = useState<string>("all");
  const [status, setStat] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamUsers, setTeamUsers] = useState<
    Array<{
      id: string;
      name: string;
      email?: string;
      avatar?: string;
      role: string;
      department?: string;
      online?: boolean;
    }>
  >([]);

  useEffect(() => {
    taskService.list().catch(() => toast.error("Unable to load tasks."));
    projectService.list().catch(() => toast.error("Unable to load projects."));

    userService
      .list()
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const normalized = (data as unknown[])
          .map((u) => u as ApiUser)
          .filter(
            (u) =>
              typeof u?.name === "string" &&
              typeof (u.id ?? u._id) === "string",
          )
          .map(normalizeUser);
        setTeamUsers(normalized);
      })
      .catch(() => undefined);
  }, []);

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q.toLowerCase()) &&
      (pri === "all" || t.priority === pri) &&
      (status === "all" || t.status === status),
  );
  const perPage = 10;
  const paged = filtered.slice(page * perPage, page * perPage + perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const getUser = (id: string) =>
    teamUsers.find((u) => u.id === id) ?? {
      id,
      name: "Unknown",
      avatar: "",
      role: "",
    };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Track work across projects with AI importance scoring."
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        }
      />

      <Card className="p-4 bg-card/60 border-border/60 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              placeholder="Search tasks…"
              className="pl-9 bg-secondary/60"
            />
          </div>
          <Select
            value={pri}
            onValueChange={(v) => {
              setPri(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {["all", "low", "medium", "high", "urgent"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStat(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {["all", "todo", "in_progress", "review", "done"].map((p) => (
                <SelectItem key={p} value={p}>
                  {p.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="bg-card/60 border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Task</th>
                <th className="text-left p-3">Assignee</th>
                <th className="text-left p-3">Priority</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Due</th>
                <th className="text-left p-3">AI</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((t) => {
                const u = getUser(t.assignee);
                return (
                  <tr
                    key={t.id}
                    className="border-t border-border/40 hover:bg-secondary/40 cursor-pointer"
                    onClick={() => setOpen(t)}
                  >
                    <td className="p-3 font-medium max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={u.avatar} />
                          <AvatarFallback>{u.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={
                          t.priority === "urgent" ? "destructive" : "outline"
                        }
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">
                        {t.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {format(new Date(t.due), "MMM d")}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs">{t.aiScore}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border/40">
          <div className="text-xs text-muted-foreground">
            Showing {paged.length} of {filtered.length}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.title}</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {open.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Assignee
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={getUser(open.assignee).avatar} />
                      </Avatar>
                      {getUser(open.assignee).name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Due</div>
                    <div className="mt-1">
                      {format(new Date(open.due), "MMM d, yyyy")}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Priority
                    </div>
                    <Badge className="mt-1">{open.priority}</Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      AI Score
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {open.aiScore}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Status
                  </div>
                  <Select
                    value={open.status}
                    onValueChange={async (v) => {
                      await taskService.update(open.id, {
                        status: v as Task["status"],
                      });
                      setStatus(open.id, v as Task["status"]);
                      setOpen({ ...open, status: v as Task["status"] });
                      toast.success("Status updated");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["todo", "in_progress", "review", "done"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-1">
                  {open.tags.map((t) => (
                    <Badge key={t} variant="outline">
                      #{t}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="destructive"
                  onClick={async () => {
                    await taskService.remove(open.id);
                    toast.success("Task deleted");
                    setOpen(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete task
                </Button>

                <div className="border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    Comments
                  </div>
                  <div className="rounded-lg bg-secondary/40 p-3 text-sm">
                    "Looks good — let's ship it this week." — Noah
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const created = await taskService.create({
                title: String(f.get("title")),
                description: String(f.get("description")),
                status: String(f.get("status")) as Task["status"],
                priority: String(f.get("priority")) as Task["priority"],
                assignee: String(f.get("assignee")),
                due: new Date(String(f.get("due"))).toISOString(),
                project: String(f.get("project")),
                aiScore: Number(f.get("aiScore")),
                tags: String(f.get("tags"))
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              });
              toast.success("Task created");
              setCreateOpen(false);
              setOpen(created as Task);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                name="title"
                required
                defaultValue="Follow up from Q4 strategy"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                name="description"
                required
                defaultValue="Capture decisions, owners, and acceptance criteria."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select name="priority" defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high", "urgent"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select name="status" defaultValue="todo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["todo", "in_progress", "review", "done"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Assignee</Label>
                <Select name="assignee" defaultValue={teamUsers[0]?.id ?? "u2"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Project</Label>
                <Select name="project" defaultValue={projects[0]?.id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Due</Label>
                <Input
                  name="due"
                  type="date"
                  required
                  defaultValue={new Date(Date.now() + 86400000 * 3)
                    .toISOString()
                    .slice(0, 10)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>AI score</Label>
                <Input
                  name="aiScore"
                  type="number"
                  min="0"
                  max="100"
                  required
                  defaultValue={86}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input name="tags" defaultValue="meeting, follow-up, ai" />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-primary-foreground border-0"
              >
                Create task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
