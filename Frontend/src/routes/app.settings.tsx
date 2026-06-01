import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUIStore } from "@/lib/stores";
import { currentUser } from "@/lib/mock";
import { toast } from "sonner";
import { Moon, Sun, Monitor } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Settings() {
  const { theme, setTheme } = useUIStore();
  const avatarInput = useRef<HTMLInputElement>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [sessionActive, setSessionActive] = useState(true);
  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your workspace, profile, and integrations." />
      <Tabs defaultValue="profile">
        <TabsList>
          {["profile","workspace","notifications","security","theme","accounts"].map(t=><TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16"><AvatarImage src={currentUser.avatar} /><AvatarFallback>AM</AvatarFallback></Avatar>
              <input ref={avatarInput} type="file" accept="image/*" className="hidden" onChange={(e) => e.currentTarget.files?.[0] && toast.success(`Avatar selected: ${e.currentTarget.files[0].name}`)} />
              <Button variant="outline" size="sm" onClick={() => avatarInput.current?.click()}>Change avatar</Button>
            </div>
            <form onSubmit={(e)=>{e.preventDefault();toast.success("Profile saved");}} className="space-y-4">
              <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Name</Label><Input defaultValue={currentUser.name} /></div><div className="space-y-1.5"><Label>Email</Label><Input defaultValue={currentUser.email} /></div></div>
              <div className="space-y-1.5"><Label>Role</Label><Input defaultValue={currentUser.role} /></div>
              <Button type="submit" className="gradient-primary text-primary-foreground border-0">Save changes</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-4">
            <div className="space-y-1.5"><Label>Workspace name</Label><Input defaultValue="IntellMeet HQ" /></div>
            <div className="space-y-1.5"><Label>Subdomain</Label><Input defaultValue="intellmeet" /></div>
            <Button onClick={()=>toast.success("Workspace updated")} className="gradient-primary text-primary-foreground border-0">Save</Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-4">
            {["Meeting reminders","Task assignments","AI insights","Weekly digest","Mentions"].map(s=><div key={s} className="flex items-center justify-between"><div className="text-sm">{s}</div><Switch defaultChecked onCheckedChange={()=>toast.success(`${s} updated`)} /></div>)}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-4">
            <div className="space-y-1.5"><Label>Change password</Label><Input type="password" placeholder="New password" /></div>
            <div className="flex items-center justify-between"><div><div className="text-sm font-medium">Two-factor authentication</div><div className="text-xs text-muted-foreground">Add an extra layer of security</div></div><Switch onCheckedChange={()=>toast.success("2FA enabled")} /></div>
            <div><div className="text-sm font-medium mb-2">Active sessions</div><div className="rounded-lg bg-secondary/40 p-3 text-sm flex justify-between">MacBook Pro • San Francisco<Button size="sm" variant="ghost" onClick={()=>toast.success("Session revoked")}>Revoke</Button></div></div>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl">
            <div className="text-sm font-medium mb-3">Appearance</div>
            <div className="grid grid-cols-3 gap-3">
              {[{v:"dark",l:"Dark",i:Moon},{v:"light",l:"Light",i:Sun}].map(o=>(
                <button key={o.v} onClick={()=>setTheme(o.v as any)} className={`rounded-xl border p-4 text-left transition ${theme===o.v?"border-primary glow":"border-border hover:border-border/80"}`}>
                  <o.i className="h-5 w-5 mb-2" /><div className="font-medium text-sm">{o.l}</div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <Card className="p-6 bg-card/60 border-border/60 max-w-2xl space-y-3">
            {["Google","Microsoft","Slack","Zoom","Notion"].map(n=><div key={n} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40"><div className="text-sm font-medium">{n}</div><Button size="sm" variant={connected.includes(n) ? "secondary" : "outline"} onClick={()=>{ setConnected((items) => items.includes(n) ? items.filter(x => x !== n) : [...items, n]); toast.success(connected.includes(n) ? `${n} disconnected` : `${n} connected`); }}>{connected.includes(n) ? "Disconnect" : "Connect"}</Button></div>)}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
