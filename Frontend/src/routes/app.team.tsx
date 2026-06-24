import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserPlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { teamService } from "@/lib/api/services";
import { useSocketStore, realtimeBus } from "@/lib/realtime";
import { toast } from "sonner";

export const Route = createFileRoute("/app/team")({ component: Team });

function Team() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [teamMembers, setTeamMembers] = useState<
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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const onlineUserIds = useSocketStore((s) => s.onlineUserIds);

  useEffect(() => {
    type UserApi = {
      id?: string;
      _id?: string;
      name?: string;
      email?: string;
      avatar?: string;
      role?: string;
      department?: string;
      online?: boolean;
    };

    apiClient
      .get<unknown[]>("/users")
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;

        const normalized = (data as unknown[])
          .map((u) => u as UserApi)
          .filter(
            (
              u,
            ): u is Required<Pick<UserApi, "name" | "role">> &
              UserApi & { id: string } =>
              typeof u?.name === "string" &&
              typeof u?.role === "string" &&
              typeof (u.id ?? u._id) === "string",
          )
          .map((u) => {
            const id = (u.id ?? u._id)!;
            return {
              id,
              name: u.name!,
              email: u.email,
              avatar:
                u.avatar ??
                `https://api.dicebear.com/9.x/glass/svg?seed=${u.name}`,
              role: u.role!,
              department: u.department ?? "General",
              online: u.online ?? false,
            };
          });

        setTeamMembers(normalized as typeof teamMembers);
      })
      .catch(() => undefined);
  }, []);

  // Keep online status in sync via socket
  useEffect(() => {
    return realtimeBus.on<{ userId: string; online: boolean; name?: string }>(
      "presence:changed",
      (payload) => {
        setTeamMembers((prev) =>
          prev.map((u) =>
            u.id === payload.userId
              ? { ...u, online: payload.online ?? u.online }
              : u,
          ),
        );
      },
    );
  }, []);

  const depts = [
    "all",
    ...Array.from(
      new Set(
        teamMembers
          .map((u) => u.department)
          .filter((d): d is string => typeof d === "string"),
      ),
    ),
  ];
  const filtered = teamMembers.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) &&
      (dept === "all" || u.department === dept),
  );

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviting(true);
    const f = new FormData(e.currentTarget);
    try {
      await teamService.invite(String(f.get("email")));
      toast.success(`Invitation sent to ${f.get("email")}`);
      setInviteOpen(false);
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Directory of every teammate with live presence and collaboration scores."
        actions={
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={() => setInviteOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teammates…"
            className="pl-9 bg-secondary/60"
          />
        </div>
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {depts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u, i) => {
          const isOnline = onlineUserIds.includes(u.id) || u.online;
          return (
            <Card
              key={u.id}
              className="p-5 bg-card/60 border-border/60 hover:border-primary/40 transition"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-card ${isOnline ? "bg-success" : "bg-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.role}
                  </div>
                  <Badge variant="outline" className="mt-1 text-[10px]">
                    {u.department}
                  </Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Collaboration</span>
                    <span>{70 + ((i * 3) % 30)}%</span>
                  </div>
                  <Progress value={70 + ((i * 3) % 30)} />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Contributions</span>
                    <span>{45 + ((i * 7) % 50)}</span>
                  </div>
                  <Progress value={45 + ((i * 7) % 50)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite teammate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input
                name="email"
                type="email"
                required
                placeholder="colleague@company.com"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviting}
                className="gradient-primary text-primary-foreground border-0"
              >
                {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
