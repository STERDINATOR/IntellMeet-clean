import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    desc: "For small teams getting started.",
    features: ["Up to 10 users", "60-min meetings", "Basic AI summaries", "Community support"],
    featured: false,
  },
  {
    name: "Business",
    price: "$24",
    desc: "Built for growing organizations.",
    features: [
      "Unlimited users",
      "Unlimited meetings",
      "Advanced AI insights",
      "Analytics & reports",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For mission-critical workloads.",
    features: [
      "SSO & SAML",
      "Dedicated infrastructure",
      "Custom AI models",
      "99.99% SLA",
      "Dedicated CSM",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs glass border-gradient mb-5">
            Simple pricing
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight">
            Plans that scale <span className="text-gradient">with your team</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free, upgrade anytime. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-7 ${
                t.featured
                  ? "glass-strong border-gradient glow-primary"
                  : "glass border-gradient"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold text-white bg-[var(--gradient-primary)]">
                  MOST POPULAR
                </div>
              )}
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-semibold">{t.price}</span>
                {t.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <Link
                to="/signup"
                className={`mt-6 inline-flex w-full justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  t.featured
                    ? "bg-[var(--gradient-primary)] text-white hover:scale-[1.02]"
                    : "glass hover:bg-white/5"
                }`}
              >
                {t.price === "Custom" ? "Contact Sales" : "Get started"}
              </Link>
              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <span className="size-5 rounded-full glass grid place-items-center">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
