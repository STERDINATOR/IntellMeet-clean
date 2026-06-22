import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { meetingService, userService } from "@/lib/api/services";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/app/meetings/new")({
  component: NewMeeting,
});

function NewMeeting() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [type, setType] = useState("Team");
  const [teamUsers, setTeamUsers] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    userService
      .list()
      .then((data) => {
        type UserLike = { id?: string; _id?: string; name?: string };
        const mapped = (data as UserLike[]).map((u) => ({
          id: String(u.id ?? u._id ?? ""),
          name: String(u.name ?? ""),
        }));
        setTeamUsers(mapped);
        setSelected(mapped.slice(0, 2).map((u) => u.id));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Schedule a meeting"
        subtitle="Set up your next meeting with AI-powered agenda assist."
      />
      <Card className="p-6 bg-card/60 border-border/60">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const created = await meetingService.create({
              title: String(f.get("title")),
              start: new Date(
                String(f.get("date")) + "T" + String(f.get("time")),
              ).toISOString(),
              duration: Number(f.get("duration")),
              status: "upcoming",
              participants: selected,
              host: "me",
              type: type as "Team" | "Client" | "1:1" | "All-hands",
              agenda: String(f.get("agenda")),
            });
            const id = typeof created === "string" ? created : created.id;
            toast.success("Meeting scheduled");
            navigate({ to: "/app/meetings/$id", params: { id } });
          }}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input name="title" required defaultValue="Strategy sync" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input name="time" type="time" required defaultValue="10:00" />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input name="duration" type="number" required defaultValue={30} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Team", "Client", "1:1", "All-hands"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Participants</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
              {teamUsers.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selected.includes(u.id)}
                    onCheckedChange={(c) =>
                      setSelected((s) =>
                        c ? [...s, u.id] : s.filter((x) => x !== u.id),
                      )
                    }
                  />
                  {u.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Agenda</Label>
            <Textarea
              name="agenda"
              rows={4}
              defaultValue="• Roadmap review&#10;• Risks and blockers&#10;• Next steps"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/app/meetings" })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-primary-foreground border-0"
            >
              Schedule meeting
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
