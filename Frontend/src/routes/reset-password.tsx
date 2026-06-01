import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") ?? "");
    setToken(params.get("token") ?? "");
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { email, token, password });
      toast.success("Your password has been reset. Please sign in.");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error("Unable to reset password. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow" />
      <Card className="relative w-full max-w-md p-8 glass elevated">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl gradient-primary glow flex items-center justify-center"><MessageSquare className="h-5 w-5 text-primary-foreground" /></div>
          <span className="font-bold">IntellMeet</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create a new password</h1>
        <p className="text-sm text-muted-foreground mt-1">Secure your workspace session with a new password.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} readOnly className="bg-secondary/60" />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm password</Label>
            <Input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
          <Button type="submit" disabled={loading || !token} className="w-full gradient-primary text-primary-foreground border-0 glow">
            {loading ? "Resetting…" : "Reset password"}
          </Button>
        </form>
        {!token && (
          <p className="text-sm text-muted-foreground mt-4">A reset token is required. Please use the link from your email.</p>
        )}
      </Card>
    </div>
  );
}
