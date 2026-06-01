import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Sparkles, Brain, Zap, BarChart3, Mail, Lock, Eye, EyeOff, Star, Info, ShieldCheck, Loader2, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore, useUIStore } from "@/lib/stores";
import { toast } from "sonner";
import portalImg from "@/assets/auth-portal.jpg";
import { apiClient, API_BASE_URL } from "@/lib/api/client";
import { connectRealtime } from "@/lib/realtime";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in to IntellMeet" }, { name: "description", content: "Access your AI-powered collaboration workspace." }] }),
  component: Login,
});

const features = [
  { icon: Brain, title: "AI Summaries", desc: "Get instant summaries and key insights from every meeting.", tint: "from-violet-500/20 to-violet-500/5", iconColor: "text-violet-400" },
  { icon: Zap, title: "Smart Actions", desc: "AI detects action items and assigns tasks automatically.", tint: "from-indigo-500/20 to-indigo-500/5", iconColor: "text-indigo-400" },
  { icon: BarChart3, title: "Team Analytics", desc: "Understand productivity and collaboration like never before.", tint: "from-cyan-500/20 to-cyan-500/5", iconColor: "text-cyan-400" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-xl gradient-primary glow flex items-center justify-center">
        <div className="h-4 w-4 rotate-45 bg-background/30 rounded-sm" />
      </div>
      <span className="text-xl font-bold tracking-tight">IntellMeet</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useUIStore();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function Login() {
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get("oauthSuccess");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const oauthError = params.get("oauthError");

    if (oauthError) {
      toast.error(`OAuth failed: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (oauthSuccess && accessToken && refreshToken) {
      const restoreSession = async () => {
        setSession({ accessToken, refreshToken });
        connectRealtime();

        try {
          const response = await apiClient.get<{ user: any }>("/auth/me");
          if (response?.user) {
            setSession({ user: response.user, accessToken, refreshToken });
          }
        } catch (error) {
          console.error("Failed to load user after OAuth login", error);
        }

        toast.success("Signed in successfully");
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate({ to: "/app/dashboard" });
      };

      void restoreSession();
    }
  }, [navigate, setSession]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const session = await apiClient.post<{ user: any; accessToken: string; refreshToken: string }>("/auth/login", {
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      setSession(session);
      connectRealtime();
      toast.success(`Welcome back, ${session.user?.name ?? "Alex"}`);
      navigate({ to: "/app/dashboard" });
    } catch (error) {
      toast.error("Unable to log in. Please check your credentials and try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const social = (provider: string) => {
    window.location.href = `${API_BASE_URL}/auth/oauth/${provider.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-mesh" />
      <div className="absolute top-6 right-6 z-50"><ThemeToggle /></div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-8">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-16 items-start">
          {/* LEFT */}
          <div className="space-y-10">
            <Logo />

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>AI-Powered Collaboration Platform</span>
            </div>

            <div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Welcome <span className="gradient-text">Back!</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-md leading-relaxed">
                Log in to your account and continue transforming meetings into intelligence.
              </p>
            </div>

            <div className="space-y-5 max-w-md">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${f.tint} border border-border/60 flex items-center justify-center`}>
                    <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                  </div>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Card className="p-5 max-w-md bg-card/40 border border-border/60 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[0,1,2].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-card bg-gradient-to-br from-primary to-accent" />
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-card bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold">+5K</div>
                </div>
                <div className="text-sm leading-snug">
                  Join 5,000+ teams already<br />collaborating smarter.
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <div className="text-sm"><span className="font-semibold">4.9/5</span> <span className="text-muted-foreground">from 1,200+ reviews</span></div>
              </div>
            </Card>
          </div>

          {/* RIGHT — login card with portal art behind */}
          <div className="relative">
            <img src={portalImg} alt="" width={896} height={1024} aria-hidden className="hidden lg:block absolute -left-32 top-10 w-[380px] opacity-50 pointer-events-none rounded-3xl" loading="lazy" />
            <Card className="relative p-8 lg:p-10 bg-card/70 border border-border/60 rounded-3xl backdrop-blur-xl elevated">
              <h2 className="text-3xl font-bold tracking-tight">
                Log in to <span className="gradient-text">IntellMeet</span>
              </h2>
              <p className="text-muted-foreground mt-2">Enter your credentials to access your workspace</p>

              <div className="space-y-3 mt-7">
                <Button type="button" variant="outline" onClick={() => social("Google")} className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 border-0 justify-center gap-3 text-sm font-medium">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.75 3.22-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
                  Continue with Google
                </Button>
                <Button type="button" variant="outline" onClick={() => social("Microsoft")} className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 border-0 justify-center gap-3 text-sm font-medium">
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                  Continue with Microsoft
                </Button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or continue with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address</label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input name="email" type="email" placeholder="you@example.com" defaultValue="alex@intellmeet.io" required className="h-12 pl-10 rounded-xl bg-input/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Password</label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input name="password" type={showPw ? "text" : "password"} placeholder="Enter your password" defaultValue="password123" required className="h-12 pl-10 pr-10 rounded-xl bg-input/50" />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer"><Checkbox defaultChecked /> Remember me</label>
                  <div className="flex items-center gap-1 text-muted-foreground"><span>Keep me signed in</span><Info className="h-3.5 w-3.5" /></div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0 glow text-base font-semibold">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Log in
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground mt-6">
                Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
              </p>

              <div className="mt-7 pt-6 border-t border-border/60 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Enterprise-grade security</div>
                  <div className="text-xs text-muted-foreground">Your data is encrypted and secure</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
