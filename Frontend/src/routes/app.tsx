import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AICopilotFAB } from "@/components/layout/AICopilotFAB";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useAuthStore, useUIStore } from "@/lib/stores";
import { apiClient, tokenManager } from "@/lib/api/client";
import { connectRealtime, startGlobalRealtimeSync } from "@/lib/realtime";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  beforeLoad: () => {
    const authed = useAuthStore.getState().isAuthed;
    if (!authed) throw redirect({ to: "/login" });
  },
});

function AppLayout() {
  const theme = useUIStore((s) => s.theme);
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!isAuthed) return;

    const loadMe = async () => {
      try {
        type AuthUser = {
          id?: string;
          _id?: string;
          name?: string;
          role?: string;
          email?: string;
          avatar?: string;
        };

        const response = await apiClient.get<{ user?: AuthUser }>("/auth/me");
        if (response?.user) {
          setSession({
            user: response.user,
            accessToken: tokenManager.getAccessToken() ?? "",
            refreshToken: tokenManager.getRefreshToken() ?? "",
          });
        }
      } catch {
        // preserve existing session if refresh fails elsewhere
      }
    };

    loadMe();
    connectRealtime();
    startGlobalRealtimeSync();
  }, [isAuthed, setSession]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <AICopilotFAB />
      <CommandPalette />
      <Toaster position="top-right" />
    </div>
  );
}
