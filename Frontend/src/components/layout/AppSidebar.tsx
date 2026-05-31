import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Video, ListTodo, FolderKanban, Users, BarChart3, FileText, Bell, Settings, Sparkles, User as UserIcon, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/meetings", label: "Meetings", icon: Video },
  { to: "/app/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/app/projects", label: "Projects", icon: FolderKanban },
  { to: "/app/tasks", label: "Tasks", icon: ListTodo },
  { to: "/app/team", label: "Team", icon: Users },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/reports", label: "Reports", icon: FileText },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
];

const bottom = [
  { to: "/app/profile", label: "Profile", icon: UserIcon },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="relative h-9 w-9 rounded-xl gradient-primary glow flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-tight">IntellMeet</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Workspace</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 no-scrollbar">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Workspace</div>
        {nav.map((n) => {
          const active = pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link key={n.to} to={n.to} className="block">
              <div className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${active ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"}`}>
                {active && (
                  <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/10 ring-1 ring-primary/30" />
                )}
                <Icon className={`relative h-4 w-4 ${active ? "text-primary" : ""}`} />
                <span className="relative">{n.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        {bottom.map((n) => {
          const active = pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"}`}>
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
