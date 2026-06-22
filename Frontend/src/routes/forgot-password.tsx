import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("alex@intellmeet.io");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      toast.success("If this account exists, a reset link has been sent.");
    } catch (error) {
      toast.error("Unable to request password reset. Please try again.");
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
          <div className="h-9 w-9 rounded-xl gradient-primary glow flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">IntellMeet</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          We'll send a reset link to your inbox.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground border-0 glow"
          >
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
