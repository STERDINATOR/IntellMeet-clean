import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { users } from "@/lib/mock";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/team")({ component: Team });

function Team() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const depts = ["all", ...Array.from(new Set(users.map(u=>u.department)))];
  const filtered = users.filter(u => u.name.toLowerCase().includes(q.toLowerCase()) && (dept==="all"||u.department===dept));

  return (
    <div>
      <PageHeader title="Team" subtitle="Directory of every teammate, with collaboration scores." />
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search teammates…" className="pl-9 bg-secondary/60" /></div>
        <Select value={dept} onValueChange={setDept}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent>{depts.map(d=><SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((u,i) => (
          <Card key={u.id} className="p-5 bg-card/60 border-border/60 hover:border-primary/40 transition">
            <div className="flex items-start gap-3">
              <div className="relative"><Avatar className="h-12 w-12"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar><span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-card ${u.online?"bg-success":"bg-muted-foreground"}`} /></div>
              <div className="flex-1 min-w-0"><div className="font-semibold truncate">{u.name}</div><div className="text-xs text-muted-foreground truncate">{u.role}</div><Badge variant="outline" className="mt-1 text-[10px]">{u.department}</Badge></div>
            </div>
            <div className="mt-4 space-y-2">
              <div><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Collaboration</span><span>{70+(i*3)%30}%</span></div><Progress value={70+(i*3)%30} /></div>
              <div><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Contributions</span><span>{45+(i*7)%50}</span></div><Progress value={45+(i*7)%50} /></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
