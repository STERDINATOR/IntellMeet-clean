import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { downloadText } from "@/lib/workflows";

export const Route = createFileRoute("/app/reports")({ component: Reports });

const reports = [
  { name: "Meeting performance", desc: "All meetings ranked by AI score", color: "from-violet-500 to-fuchsia-500" },
  { name: "Team productivity", desc: "Per-teammate productivity over time", color: "from-cyan-400 to-sky-500" },
  { name: "AI usage", desc: "Copilot queries, summaries, action items", color: "from-emerald-400 to-teal-500" },
  { name: "Workspace health", desc: "Engagement, sentiment, retention", color: "from-amber-400 to-orange-500" },
  { name: "Project velocity", desc: "Tasks closed per week per project", color: "from-rose-400 to-pink-500" },
  { name: "Executive summary", desc: "C-suite view across all metrics", color: "from-indigo-400 to-blue-500" },
];

function Reports() {
  const exportReport = (name: string, format: "PDF" | "Excel") => {
    const slug = name.toLowerCase().replace(/\W+/g, "-");
    const body = `IntellMeet ${name}\nGenerated: ${new Date().toLocaleString()}\n\nSummary\n- Meetings reviewed: 24\n- Action items created: 87\n- Average meeting score: 92\n- Top risk: WebRTC SFU migration timeline\n`;
    downloadText(`${slug}.${format === "PDF" ? "txt" : "csv"}`, format === "PDF" ? body : body.replaceAll("\n", "\r\n"), format === "PDF" ? "text/plain;charset=utf-8" : "text/csv;charset=utf-8");
    toast.success(`${name} ${format} downloaded`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Export pre-built reports as PDF or Excel." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(r=>(
          <Card key={r.name} className="p-5 bg-card/60 border-border/60">
            <div className={`h-1 rounded-full bg-gradient-to-r ${r.color} mb-4`} />
            <div className="flex items-start gap-3"><FileText className="h-5 w-5 text-primary" /><div><div className="font-semibold">{r.name}</div><div className="text-xs text-muted-foreground mt-1">{r.desc}</div></div></div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={()=>exportReport(r.name, "PDF")}><Download className="h-3 w-3 mr-1" />PDF</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={()=>exportReport(r.name, "Excel")}><Download className="h-3 w-3 mr-1" />Excel</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
