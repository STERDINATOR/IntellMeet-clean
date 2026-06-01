import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUser, tasks, meetings } from "@/lib/mock";
import { Award, Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const [open, setOpen] = useState(false);
  const skills = ["Product Strategy","AI Systems","Public Speaking","Roadmapping","User Research","Distributed Teams"];
  return (
    <div>
      <PageHeader title="Profile" />
      <Card className="overflow-hidden bg-card/60 border-border/60">
        <div className="h-40 relative gradient-primary">
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between">
            <Avatar className="h-24 w-24 ring-4 ring-card"><AvatarImage src={currentUser.avatar} /><AvatarFallback>AM</AvatarFallback></Avatar>
            <Button variant="outline" onClick={()=>setOpen(true)}><Edit2 className="h-3 w-3 mr-1" />Edit Profile</Button>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{currentUser.name}</div>
            <div className="text-sm text-muted-foreground">{currentUser.role} • {currentUser.department}</div>
            <div className="text-sm text-muted-foreground mt-1">{currentUser.email}</div>
            <div className="flex flex-wrap gap-1 mt-3">{skills.map(s=><Badge key={s} variant="outline">{s}</Badge>)}</div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="p-5 bg-card/60 border-border/60"><div className="text-xs text-muted-foreground">Productivity</div><div className="text-3xl font-bold mt-2">92</div><Progress value={92} className="mt-3" /></Card>
        <Card className="p-5 bg-card/60 border-border/60"><div className="text-xs text-muted-foreground">Meetings hosted</div><div className="text-3xl font-bold mt-2">{meetings.filter(m=>m.host==="me").length || 12}</div></Card>
        <Card className="p-5 bg-card/60 border-border/60"><div className="text-xs text-muted-foreground">Tasks completed</div><div className="text-3xl font-bold mt-2">{tasks.filter(t=>t.status==="done").length}</div></Card>
      </div>

      <Card className="mt-4 p-6 bg-card/60 border-border/60">
        <Tabs defaultValue="meetings">
          <TabsList>
            <TabsTrigger value="meetings">Meeting history</TabsTrigger>
            <TabsTrigger value="tasks">Assigned tasks</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Recent activity</TabsTrigger>
          </TabsList>
          <TabsContent value="meetings" className="mt-4 space-y-2">
            {meetings.slice(0,5).map(m=><div key={m.id} className="flex justify-between p-3 rounded-lg hover:bg-secondary/60"><div><div className="font-medium text-sm">{m.title}</div><div className="text-xs text-muted-foreground">{format(new Date(m.start),"MMM d, HH:mm")}</div></div><Badge variant="secondary">{m.score||"upcoming"}</Badge></div>)}
          </TabsContent>
          <TabsContent value="tasks" className="mt-4 space-y-2">
            {tasks.slice(0,5).map(t=><div key={t.id} className="flex justify-between p-3 rounded-lg hover:bg-secondary/60"><div className="text-sm">{t.title}</div><Badge variant="outline">{t.status}</Badge></div>)}
          </TabsContent>
          <TabsContent value="achievements" className="mt-4 grid sm:grid-cols-3 gap-3">
            {[{t:"AI Pioneer",d:"Shipped 10+ AI features"},{t:"Team Player",d:"100+ meetings hosted"},{t:"Decision Maker",d:"50+ key decisions"}].map(a=><Card key={a.t} className="p-4 bg-secondary/40 border-0"><Award className="h-6 w-6 text-warning mb-2" /><div className="font-semibold text-sm">{a.t}</div><div className="text-xs text-muted-foreground">{a.d}</div></Card>)}
          </TabsContent>
          <TabsContent value="activity" className="mt-4 space-y-2">
            {["Completed task: Refactor WebRTC","Joined Q4 Strategy meeting","Created project Atlas","Promoted to Founder"].map((a,i)=><div key={i} className="text-sm p-2">• {a}</div>)}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          <form onSubmit={(e)=>{e.preventDefault();toast.success("Profile updated");setOpen(false);}} className="space-y-4">
            <div className="space-y-1.5"><Label>Name</Label><Input defaultValue={currentUser.name} /></div>
            <div className="space-y-1.5"><Label>Role</Label><Input defaultValue={currentUser.role} /></div>
            <div className="space-y-1.5"><Label>Department</Label><Input defaultValue={currentUser.department} /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" className="gradient-primary text-primary-foreground border-0">Save</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
