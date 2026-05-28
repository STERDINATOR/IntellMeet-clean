import { motion } from "framer-motion";
import { Brain, MessageSquare, Video, BarChart3, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Meeting Intelligence",
    desc: "Transcribe, summarize and extract action items automatically.",
    tint: "from-primary/30 to-primary/0",
  },
  {
    icon: MessageSquare,
    title: "Real-time Collaboration",
    desc: "Chat, share and collaborate with your team in real time.",
    tint: "from-magenta/30 to-magenta/0",
  },
  {
    icon: Video,
    title: "Crystal Clear Meetings",
    desc: "HD video, noise cancellation and seamless screen sharing.",
    tint: "from-cyan/30 to-cyan/0",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    desc: "Track productivity, engagement and team performance.",
    tint: "from-magenta/30 to-primary/0",
  },
];

export function Features() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative rounded-2xl glass border-gradient p-6 overflow-hidden hover:bg-white/[0.04] transition-colors"
            >
              <div
                aria-hidden
                className={`absolute -top-20 -right-10 size-40 rounded-full blur-3xl bg-gradient-to-br ${f.tint}`}
              />
              <ArrowUpRight className="absolute top-4 right-4 size-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              <div className="size-12 rounded-xl glass-strong grid place-items-center mb-5 group-hover:scale-110 transition-transform">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
