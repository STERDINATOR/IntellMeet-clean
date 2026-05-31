import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Sparkles } from "lucide-react";
import { useTasksStore } from "@/lib/stores";
import { findUser } from "@/lib/mock";
import { format } from "date-fns";
import { useState } from "react";
import type { Task } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/tasks")({ component: Tasks });

function Tasks() {
  const { tasks, setStatus, update } = useTasksStore();
  const [q, setQ] = useState("");
  const [pri, setPri] = useState<string>("all");
  const [status, setStat] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<Task | null>(null);
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(q.toLowerCase()) && (pri === "all" || t.priority === pri) && (status === "all" || t.status === status));
  const perPage = 10;
  const paged = filtered.slice(page*perPage, page*perPage+perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Track work across projects with AI importance scoring." actions={<Button className="gradient-primary text-primary-foreground border-0" onClick={() => toast.success("Task created")}><Plus className="h-4 w-4 mr-2" />New Task</Button>} />

      <Card className="p-4 bg-card/60 border-border/60 mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e)=>{setQ(e.target.value); setPage(0);}} placeholder="Search tasks…" className="pl-9 bg-secondary/60" /></div>
          <Select value={pri} onValueChange={(v)=>{setPri(v); setPage(0);}}><SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger><SelectContent>{["all","low","medium","high","urgent"].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
          <Select value={status} onValueChange={(v)=>{setStat(v); setPage(0);}}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{["all","todo","in_progress","review","done"].map(p=><SelectItem key={p} value={p}>{p.replace("_"," ")}</SelectItem>)}</SelectContent></Select>
        </div>
      </Card>

      <Card className="bg-card/60 border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left p-3">Task</th><th className="text-left p-3">Assignee</th><th className="text-left p-3">Priority</th><th className="text-left p-3">Status</th><th className="text-left p-3">Due</th><th className="text-left p-3">AI</th></tr>
            </thead>
            <tbody>
              {paged.map(t => { const u = findUser(t.assignee); return (
                <tr key={t.id} className="border-t border-border/40 hover:bg-secondary/40 cursor-pointer" onClick={() => setOpen(t)}>
                  <td className="p-3 font-medium max-w-xs truncate">{t.title}</td>
                  <td className="p-3"><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar><span className="text-xs">{u.name}</span></div></td>
                  <td className="p-3"><Badge variant={t.priority === "urgent" ? "destructive" : "outline"}>{t.priority}</Badge></td>
                  <td className="p-3"><Badge variant="secondary">{t.status.replace("_"," ")}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{format(new Date(t.due),"MMM d")}</td>
                  <td className="p-3"><div className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" /><span className="text-xs">{t.aiScore}</span></div></td>
                </tr>
              ); })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-border/40">
          <div className="text-xs text-muted-foreground">Showing {paged.length} of {filtered.length}</div>
          <div className="flex gap-1"><Button size="sm" variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Prev</Button><Button size="sm" variant="outline" disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}>Next</Button></div>
        </div>
      </Card>

      <Sheet open={!!open} onOpenChange={(o)=>!o && setOpen(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          {open && (() => { const u = findUser(open.assignee); return (
            <>
              <SheetHeader><SheetTitle>{open.title}</SheetTitle></SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-sm text-muted-foreground">{open.description}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-xs text-muted-foreground">Assignee</div><div className="flex items-center gap-2 mt-1"><Avatar className="h-6 w-6"><AvatarImage src={u.avatar} /></Avatar>{u.name}</div></div>
                  <div><div className="text-xs text-muted-foreground">Due</div><div className="mt-1">{format(new Date(open.due),"MMM d, yyyy")}</div></div>
                  <div><div className="text-xs text-muted-foreground">Priority</div><Badge className="mt-1">{open.priority}</Badge></div>
                  <div><div className="text-xs text-muted-foreground">AI Score</div><div className="flex items-center gap-1 mt-1"><Sparkles className="h-3 w-3 text-primary" />{open.aiScore}</div></div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  <Select value={open.status} onValueChange={(v) => { setStatus(open.id, v as Task["status"]); setOpen({ ...open, status: v as Task["status"] }); toast.success("Status updated"); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["todo","in_progress","review","done"].map(p=><SelectItem key={p} value={p}>{p.replace("_"," ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-1">{open.tags.map(t => <Badge key={t} variant="outline">#{t}</Badge>)}</div>
                <div className="border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground mb-2">Comments</div>
                  <div className="rounded-lg bg-secondary/40 p-3 text-sm">"Looks good — let's ship it this week." — Noah</div>
                </div>
              </div>
            </>
          ); })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
