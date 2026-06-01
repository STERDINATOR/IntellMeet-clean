import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AICopilotFAB } from "@/components/layout/AICopilotFAB";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import { useAuthStore, useUIStore } from "@/lib/stores";
import { apiClient, tokenManager } from "@/lib/api/client";

export const Route = createFileRoute("/app")({
  component: AppLayout,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("im-auth");
      const authed = raw ? JSON.parse(raw)?.state?.isAuthed : false;
      if (!authed) throw redirect({ to: "/login" });
    }
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
        const response = await apiClient.get<{ user: any }>("/auth/me");
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
