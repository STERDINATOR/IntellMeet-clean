import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/mock";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/analytics")({ component: Analytics });

function Analytics() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Meeting trends, productivity, and effectiveness." actions={<Button variant="outline" onClick={()=>toast.success("Report exported")}><Download className="h-4 w-4 mr-2" />Export Report</Button>} />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/60 border-border/60 lg:col-span-2">
          <div className="font-semibold mb-3">Meeting trends</div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={analytics.meetingTrends}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5}/><stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="meetings" stroke="var(--primary)" fill="url(#ga)" strokeWidth={2} />
                <Area type="monotone" dataKey="focus" stroke="var(--accent)" fill="url(#gb)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60">
          <div className="font-semibold mb-3">Meeting effectiveness</div>
          <div className="h-72">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={analytics.effectiveness} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0,100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} fill="var(--primary)" />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-44 text-4xl font-bold">{analytics.effectiveness[0].value}%</div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60 lg:col-span-2">
          <div className="font-semibold mb-3">Participation by teammate</div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={analytics.participation}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/60">
          <div className="font-semibold mb-3">Productivity</div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={analytics.productivity}>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2} dot={{ fill: "var(--accent)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 bg-card/60 border-border/60 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{background:"var(--gradient-glow)"}} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary" /><div className="font-semibold">AI recommendations</div></div>
            <div className="grid md:grid-cols-3 gap-3">
              {["Move standups to async — save 4h/wk","Top performer this month: Sophia Kim","Friday meeting load is too high"].map(s=><div key={s} className="rounded-xl bg-secondary/40 p-4 text-sm">{s}</div>)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
