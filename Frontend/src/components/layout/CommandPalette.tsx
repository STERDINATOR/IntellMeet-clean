import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUIStore } from "@/lib/stores";
import {
  BarChart3,
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Plus,
  Settings,
  Sparkles,
  User,
  Users,
  Video,
  FileText,
} from "lucide-react";

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  const go = (to: string) => {
    setCommandOpen(false);
    navigate({ to });
  };

  const items = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
    { label: "Meetings", icon: Video, to: "/app/meetings" },
    { label: "New Meeting", icon: Plus, to: "/app/meetings/new" },
    { label: "AI Assistant", icon: Sparkles, to: "/app/ai-assistant" },
    { label: "Projects", icon: FolderKanban, to: "/app/projects" },
    { label: "Tasks", icon: ListTodo, to: "/app/tasks" },
    { label: "Team", icon: Users, to: "/app/team" },
    { label: "Analytics", icon: BarChart3, to: "/app/analytics" },
    { label: "Reports", icon: FileText, to: "/app/reports" },
    { label: "Notifications", icon: Bell, to: "/app/notifications" },
    { label: "Profile", icon: User, to: "/app/profile" },
    { label: "Settings", icon: Settings, to: "/app/settings" },
  ];

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((it) => (
            <CommandItem key={it.to} onSelect={() => go(it.to)}>
              <it.icon className="h-4 w-4 mr-2" /> {it.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
