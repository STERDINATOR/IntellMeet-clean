import { motion } from "framer-motion";
import { Users, MessageCircle, Power, Star } from "lucide-react";
import dashImg from "@/assets/dashboard-preview.jpg";

const stats = [
  { icon: Users, value: "10K+", label: "Active Teams" },
  { icon: MessageCircle, value: "1M+", label: "Meetings Held" },
  { icon: Power, value: "99.9%", label: "Uptime" },
  { icon: Star, value: "4.9/5", label: "User Rating" },
];

export function DashboardShowcase() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs glass border-gradient">
              <span className="size-1.5 rounded-full bg-primary" />
              Built for modern teams
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-5 font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]"
            >
              Everything you need to
              <br /> <span className="text-gradient">collaborate in one place.</span>
            </motion.h2>
            <p className="mt-5 text-muted-foreground max-w-md">
              From meetings to projects, chats to documents, IntellMeet keeps your
              team aligned and productive.
            </p>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="text-center sm:text-left"
                >
                  <div className="size-10 rounded-xl glass border-gradient grid place-items-center mx-auto sm:mx-0 mb-3">
                    <s.icon className="size-4 text-primary" />
                  </div>
                  <div className="font-display text-3xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -inset-10 blur-3xl opacity-60 -z-10"
              style={{ background: "var(--gradient-aurora)" }}
            />
            <div className="rounded-3xl overflow-hidden glass-strong border-gradient">
              <img
                src={dashImg}
                alt="IntellMeet dashboard with AI summary, upcoming meetings and analytics"
                width={1600}
                height={1100}
                loading="lazy"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
