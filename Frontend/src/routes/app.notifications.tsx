import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotificationsStore } from "@/lib/stores";
import { notificationService } from "@/lib/api/services";
import { formatDistanceToNow } from "date-fns";
import { Bell, Video, ListTodo, AtSign, Sparkles, Building } from "lucide-react";
import { useEffect } from "react";
import type { Notification } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

const icons: Record<Notification["type"], any> = { meeting: Video, task: ListTodo, mention: AtSign, ai: Sparkles, workspace: Building };

function Notifications() {
  const { items } = useNotificationsStore();
  const filter = (type: string) => type === "all" ? items : items.filter(n=>n.type===type);

  useEffect(() => {
    notificationService.list().catch(() => toast.error("Unable to fetch notifications."));
  }, []);

  return (
    <div>
      <PageHeader title="Notifications" actions={<Button variant="outline" onClick={async () => { await notificationService.markAllRead().catch(() => toast.error("Unable to mark all as read.")); }}>Mark all read</Button>} />
      <Tabs defaultValue="all">
        <TabsList>
          {["all","meeting","task","mention","ai","workspace"].map(t=><TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}
        </TabsList>
        {["all","meeting","task","mention","ai","workspace"].map(t=>(
          <TabsContent key={t} value={t} className="mt-4 space-y-2">
            {filter(t).map(n => { const Icon = icons[n.type] ?? Bell; return (
              <Card key={n.id} className={`p-4 bg-card/60 border-border/60 flex items-start gap-3 cursor-pointer ${!n.read?"border-l-4 border-l-primary":""}`} onClick={async () => { await notificationService.markRead(n.id).catch(() => toast.error("Unable to mark notification read.")); }}>
                <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.time), { addSuffix: true })}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={async (e) => { e.stopPropagation(); await notificationService.remove(n.id).then(() => toast.success("Notification deleted")).catch(() => toast.error("Unable to delete notification.")); }}>Delete</Button>
              </Card>
            ); })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
