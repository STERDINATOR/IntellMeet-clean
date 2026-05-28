import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { label: "Product", to: "/" },
  { label: "Solutions", to: "/" },
  { label: "Resources", to: "/" },
  { label: "Pricing", to: "/" },
  { label: "Enterprise", to: "/" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between gap-6 rounded-2xl px-4 sm:px-6 py-3 transition-all ${
            scrolled ? "glass-strong" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="size-8 rounded-lg bg-[var(--gradient-primary)] grid place-items-center glow-primary">
                <Sparkles className="size-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-[var(--gradient-primary)] blur-md opacity-50 -z-10 group-hover:opacity-80 transition-opacity" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Intell<span className="text-gradient">Meet</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href="#"
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="group relative inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white bg-[var(--gradient-primary)] glow-primary hover:scale-[1.02] transition-transform"
            >
              Get Started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
