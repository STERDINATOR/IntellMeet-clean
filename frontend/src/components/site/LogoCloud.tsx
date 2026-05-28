import { motion } from "framer-motion";

const logos = ["Microsoft", "Google", "Notion", "Linear", "Vercel", "airbnb", "Slack"];

export function LogoCloud() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by innovative teams worldwide
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-2xl font-display font-semibold text-muted-foreground/70"
        >
          {logos.map((l) => (
            <span
              key={l}
              className="hover:text-foreground transition-colors cursor-default"
            >
              {l}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
