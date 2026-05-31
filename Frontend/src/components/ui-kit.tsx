import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function StatCard({ label, value, change, icon: Icon, accent = "primary" }: { label: string; value: string | number; change?: string; icon: LucideIcon; accent?: "primary" | "accent" | "success" | "warning" }) {
  const accentMap = {
    primary: "from-primary/30 to-primary/0 text-primary",
    accent: "from-accent/30 to-accent/0 text-accent",
    success: "from-success/30 to-success/0 text-success",
    warning: "from-warning/30 to-warning/0 text-warning",
  } as const;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden p-5 border-border/60 bg-card/60 backdrop-blur">
        <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl bg-gradient-to-br", accentMap[accent])} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
            <div className="text-3xl font-bold mt-2 tracking-tight">{value}</div>
            {change && <div className="text-xs text-success mt-1">{change}</div>}
          </div>
          <div className={cn("h-10 w-10 rounded-xl bg-secondary/80 flex items-center justify-center", accentMap[accent].split(" ").slice(-1))}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("glass rounded-2xl p-5", className)}>{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-12 w-12 rounded-2xl gradient-primary glow flex items-center justify-center mb-4">
        <span className="text-primary-foreground text-xl">✨</span>
      </div>
      <div className="font-semibold">{title}</div>
      {description && <div className="text-sm text-muted-foreground mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
