import { Sparkles } from "lucide-react";

const cols = [
  { title: "Product", items: ["Features", "Integrations", "Changelog", "Roadmap"] },
  { title: "Company", items: ["About", "Customers", "Careers", "Blog"] },
  { title: "Resources", items: ["Documentation", "Help center", "Community", "Security"] },
  { title: "Legal", items: ["Privacy", "Terms", "DPA", "Cookies"] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-[var(--gradient-primary)] grid place-items-center glow-primary">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">
                Intell<span className="text-gradient">Meet</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The AI-powered collaboration platform built for modern teams.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold mb-4">{c.title}</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {c.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="hover:text-foreground transition-colors">
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} IntellMeet, Inc. All rights reserved.</p>
          <p>Crafted with intent. Made for teams that ship.</p>
        </div>
      </div>
    </footer>
  );
}
