import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — IntellMeet" }] }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <main className="relative min-h-screen grid place-items-center px-4 overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "var(--gradient-aurora)" }} />
      <div aria-hidden className="absolute inset-0 -z-10 grid-bg" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md glass-strong border-gradient rounded-3xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="size-8 rounded-lg bg-[var(--gradient-primary)] grid place-items-center glow-primary">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-display font-semibold">Intell<span className="text-gradient">Meet</span></span>
        </Link>
        <h1 className="font-display text-3xl font-semibold">Create your workspace</h1>
        <p className="text-sm text-muted-foreground mt-2">Start your 14-day free trial — no card required.</p>

        <form className="mt-8 space-y-4">
          <Field icon={User} type="text" placeholder="Alex Morgan" label="Full name" />
          <Field icon={Mail} type="email" placeholder="you@company.com" label="Work email" />
          <Field icon={Lock} type="password" placeholder="••••••••" label="Password" />
          <button type="button" className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white bg-[var(--gradient-primary)] glow-primary hover:scale-[1.01] transition-transform">
            Create account <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:text-primary">Log in</Link>
        </p>
      </motion.div>
    </main>
  );
}

function Field({ icon: Icon, label, ...props }: { icon: any; label: string; type: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1.5 block">{label}</span>
      <div className="relative">
        <Icon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          {...props}
          className="w-full glass rounded-xl pl-10 pr-3 py-3 text-sm bg-transparent outline-none focus:border-primary/60 transition-colors"
        />
      </div>
    </label>
  );
}
