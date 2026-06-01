import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Search, Moon, Sun, LogOut, Plus, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useNotificationsStore, useUIStore } from "@/lib/stores";
import { apiClient } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";

export function Topbar() {
  const { theme, setTheme, setCommandOpen } = useUIStore();
  const { items, markAllRead, markRead } = useNotificationsStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = items.filter((n) => !n.read).length;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // swallow logout errors and clear local session anyway
    }
    logout();
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/60 px-4 md:px-6 backdrop-blur-xl">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          onFocus={() => setCommandOpen(true)}
          placeholder="Search meetings, tasks, people…"
          className="pl-9 pr-16 bg-secondary/60 border-border/60"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 flex items-center gap-0.5">
          <Command className="h-3 w-3" />K
        </kbd>
      </div>

      <Button size="sm" className="gradient-primary text-primary-foreground border-0 glow hidden sm:inline-flex" onClick={() => navigate({ to: "/app/meetings/new" })}>
        <Plus className="h-4 w-4 mr-1" /> New Meeting
      </Button>

      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary glow" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="font-semibold text-sm">Notifications</div>
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all read</button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.slice(0,8).map((n) => (
              <button key={n.id} onClick={() => markRead(n.id)} className={`w-full text-left flex gap-3 p-3 border-b border-border/40 hover:bg-secondary/60 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className={`mt-1 h-2 w-2 rounded-full ${!n.read ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</div>
                </div>
              </button>
            ))}
          </div>
          <Link to="/app/notifications" className="block text-center text-xs p-3 text-primary hover:underline border-t border-border">View all</Link>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.slice(0, 2) ?? "ME"}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/app/profile" })}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
