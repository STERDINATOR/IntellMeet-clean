import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useUIStore } from "@/lib/stores";
import { toast } from "sonner";
import { Moon, Sun, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const { theme, setTheme } = useUIStore();
  const { user, setSession, accessToken, refreshToken } = useAuthStore();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [connected, setConnected] = useState<string[]>([]);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    const f = new FormData(e.currentTarget);
    try {
      const updated = await apiClient.patch<any>("/users/me", {
        name: String(f.get("name")),
        department: String(f.get("department")),
      });
      setSession({
        user: updated,
        accessToken: accessToken ?? "",
        refreshToken: refreshToken ?? "",
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveWorkspace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingWorkspace(true);
    const f = new FormData(e.currentTarget);
    try {
      await apiClient.patch("/workspace", {
        name: String(f.get("name")),
        slug: String(f.get("slug")),
      });
      toast.success("Workspace updated");
    } catch {
      toast.error("Failed to update workspace. Admin role required.");
    } finally {
      setSavingWorkspace(false);
    }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingPassword(true);
    const f = new FormData(e.currentTarget);
    const newPw = String(f.get("newPassword"));
    const confirm = String(f.get("confirmPassword"));
    if (newPw !== confirm) {
      toast.error("Passwords do not match");
      setSavingPassword(false);
      return;
    }
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      setSavingPassword(false);
      return;
    }
    try {
      // Uses the reset-password flow via current auth token
      await apiClient.patch("/users/me/password", { password: newPw });
      toast.success("Password changed");
      (e.target as HTMLFormElement).reset();
    } catch {
      // Fallback: route doesn't exist yet — notify user
      toast.error(
        "Password change requires backend /users/me/password endpoint.",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your workspace, profile, and integrations."
      />
      <Tabs defaultValue="profile">
        <TabsList>
          {[
            "profile",
            "workspace",
            "notifications",
            "security",
            "theme",
            "accounts",
          ].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.currentTarget.files?.[0] &&
                  toast.info("Avatar upload requires file storage integration.")
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => avatarInput.current?.click()}
              >
                Change avatar
              </Button>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input name="name" defaultValue={user.name} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    defaultValue={user.email}
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input name="department" defaultValue={user.department ?? ""} />
              </div>
              <Button
                type="submit"
                disabled={savingProfile}
                className="gradient-primary text-primary-foreground border-0"
              >
                {savingProfile && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save changes
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Workspace */}
        <TabsContent value="workspace" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl">
            <form onSubmit={saveWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Workspace name</Label>
                <Input name="name" defaultValue="IntellMeet HQ" required />
              </div>
              <div className="space-y-1.5">
                <Label>Subdomain / slug</Label>
                <Input name="slug" defaultValue="intellmeet" required />
              </div>
              <Button
                type="submit"
                disabled={savingWorkspace}
                className="gradient-primary text-primary-foreground border-0"
              >
                {savingWorkspace && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-4">
            {[
              "Meeting reminders",
              "Task assignments",
              "AI insights",
              "Weekly digest",
              "Mentions",
            ].map((s) => (
              <div key={s} className="flex items-center justify-between">
                <div className="text-sm">{s}</div>
                <Switch
                  defaultChecked
                  onCheckedChange={(v) =>
                    toast.success(`${s} ${v ? "enabled" : "disabled"}`)
                  }
                />
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-6">
            <form onSubmit={changePassword} className="space-y-4">
              <div className="font-semibold text-sm">Change password</div>
              <div className="space-y-1.5">
                <Label>New password</Label>
                <Input
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <Input
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                />
              </div>
              <Button type="submit" disabled={savingPassword} variant="outline">
                {savingPassword && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Change password
              </Button>
            </form>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <div className="text-sm font-medium">
                  Two-factor authentication
                </div>
                <div className="text-xs text-muted-foreground">
                  Add an extra layer of security
                </div>
              </div>
              <Switch
                onCheckedChange={(v) =>
                  toast.info(
                    v
                      ? "2FA setup requires authenticator app integration."
                      : "2FA disabled",
                  )
                }
              />
            </div>
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-medium mb-2">Active sessions</div>
              <div className="rounded-lg bg-secondary/40 p-3 text-sm flex justify-between items-center">
                <span>
                  Current session •{" "}
                  {navigator.userAgent.includes("Mac") ? "macOS" : "Windows"}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    toast.info(
                      "Session revocation requires backend session management.",
                    )
                  }
                >
                  Revoke
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Theme */}
        <TabsContent value="theme" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl">
            <div className="text-sm font-medium mb-3">Appearance</div>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {(
                [
                  { v: "dark", l: "Dark", i: Moon },
                  { v: "light", l: "Light", i: Sun },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setTheme(o.v)}
                  className={`rounded-xl border p-4 text-left transition ${theme === o.v ? "border-primary glow" : "border-border hover:border-border/80"}`}
                >
                  <o.i className="h-5 w-5 mb-2" />
                  <div className="font-medium text-sm">{o.l}</div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Accounts / Integrations */}
        <TabsContent value="accounts" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-3">
            {["Google", "Microsoft", "Slack", "Zoom", "Notion"].map((n) => (
              <div
                key={n}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/40"
              >
                <div className="text-sm font-medium">{n}</div>
                <Button
                  size="sm"
                  variant={connected.includes(n) ? "secondary" : "outline"}
                  onClick={() => {
                    setConnected((items) =>
                      items.includes(n)
                        ? items.filter((x) => x !== n)
                        : [...items, n],
                    );
                    toast.success(
                      connected.includes(n)
                        ? `${n} disconnected`
                        : `${n} connected`,
                    );
                  }}
                >
                  {connected.includes(n) ? "Disconnect" : "Connect"}
                </Button>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
