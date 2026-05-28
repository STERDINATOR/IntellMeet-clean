import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl glass-strong border-gradient p-10 sm:p-16 text-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-80"
            style={{ background: "var(--gradient-aurora)" }}
          />
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs glass mb-6">
            <Sparkles className="size-3.5 text-primary" />
            Join 10,000+ teams
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight">
            The future of <span className="text-gradient">team collaboration</span>
            <br /> starts today.
          </h2>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
            Start your free trial. Set up in minutes. Cancel anytime.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium text-white bg-[var(--gradient-primary)] glow-primary hover:scale-[1.02] transition-transform"
            >
              Start Free Trial
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-medium glass hover:bg-white/5"
            >
              Explore Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
