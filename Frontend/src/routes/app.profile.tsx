import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore, useMeetingsStore, useTasksStore } from "@/lib/stores";
import { Award, Edit2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const { user, setSession, accessToken, refreshToken } = useAuthStore();
  const meetings = useMeetingsStore((s) => s.meetings);
  const tasks = useTasksStore((s) => s.tasks);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const myMeetings = meetings
    .filter((m) => m.host === "me" || m.participants.includes("me"))
    .slice(0, 8);
  const myTasks = tasks
    .filter((t) => t.assignee === "me" || t.assignee === user.id)
    .slice(0, 8);
  const doneTasks = tasks.filter(
    (t) =>
      (t.assignee === "me" || t.assignee === user.id) && t.status === "done",
  ).length;
  const hostedMeetings = meetings.filter(
    (m) => m.host === "me" || m.host === user.id,
  ).length;

  const skills = [
    "Product Strategy",
    "AI Systems",
    "Public Speaking",
    "Roadmapping",
    "User Research",
    "Distributed Teams",
  ];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const f = new FormData(e.currentTarget);
    try {
      type UserUpdatePayload = {
        name?: string;
        department?: string;
        avatar?: string;
      };
      const updated = await apiClient.patch<UserUpdatePayload>("/users/me", {
        name: String(f.get("name")),
        department: String(f.get("department")),
      });
      setSession({
        user: updated as unknown as typeof user,
        accessToken: accessToken ?? "",
        refreshToken: refreshToken ?? "",
      });
      toast.success("Profile updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" />
      <Card className="overflow-hidden bg-card/60 border-border/60">
        <div className="h-40 relative gradient-primary">
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={() => setOpen(true)}>
              <Edit2 className="h-3 w-3 mr-1" />
              Edit Profile
            </Button>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{user.name}</div>
            <div className="text-sm text-muted-foreground">
              {user.role} • {user.department}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {user.email}
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {skills.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-5 bg-card/60 border-border/60">
          <div className="text-xs text-muted-foreground">
            AI Productivity Score
          </div>
          <div className="text-3xl font-bold mt-2">92</div>
          <Progress value={92} className="mt-3" />
        </Card>
        <Card className="p-5 bg-card/60 border-border/60">
          <div className="text-xs text-muted-foreground">Meetings hosted</div>
          <div className="text-3xl font-bold mt-2">{hostedMeetings || 12}</div>
        </Card>
        <Card className="p-5 bg-card/60 border-border/60">
          <div className="text-xs text-muted-foreground">Tasks completed</div>
          <div className="text-3xl font-bold mt-2">{doneTasks}</div>
        </Card>
      </div>

      <Card className="mt-4 p-6 bg-card/60 border-border/60">
        <Tabs defaultValue="meetings">
          <TabsList>
            <TabsTrigger value="meetings">Meeting history</TabsTrigger>
            <TabsTrigger value="tasks">Assigned tasks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="mt-4 space-y-2">
            {myMeetings.length > 0 ? (
              myMeetings.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between p-3 rounded-lg hover:bg-secondary/60"
                >
                  <div>
                    <div className="font-medium text-sm">{m.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(m.start), "MMM d, HH:mm")} • {m.duration}
                      min
                    </div>
                  </div>
                  <Badge variant="secondary">{m.score || m.status}</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-4">
                No meetings yet.
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-2">
            {myTasks.length > 0 ? (
              myTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between p-3 rounded-lg hover:bg-secondary/60"
                >
                  <div className="text-sm flex-1 mr-3 truncate">{t.title}</div>
                  <Badge variant="outline">{t.status.replace("_", " ")}</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-4">
                No tasks assigned.
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="achievements"
            className="mt-4 grid sm:grid-cols-3 gap-3"
          >
            {[
              { t: "AI Pioneer", d: "Shipped 10+ AI features" },
              {
                t: "Team Player",
                d: `${hostedMeetings || 12}+ meetings hosted`,
              },
              { t: "Decision Maker", d: "50+ key decisions" },
            ].map((a) => (
              <Card key={a.t} className="p-4 bg-secondary/40 border-0">
                <Award className="h-6 w-6 text-warning mb-2" />
                <div className="font-semibold text-sm">{a.t}</div>
                <div className="text-xs text-muted-foreground">{a.d}</div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input name="department" defaultValue={user.department ?? ""} />
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
                disabled={saving}
                className="gradient-primary text-primary-foreground border-0"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
