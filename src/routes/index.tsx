import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { LogoCloud } from "@/components/site/LogoCloud";
import { Features } from "@/components/site/Features";
import { DashboardShowcase } from "@/components/site/DashboardShowcase";
import { Pricing } from "@/components/site/Pricing";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntellMeet — AI-Powered Collaboration Platform" },
      {
        name: "description",
        content:
          "Meet smarter, collaborate better. IntellMeet brings AI-driven insights, real-time collaboration and next-gen meetings to modern teams.",
      },
      { property: "og:title", content: "IntellMeet — AI-Powered Collaboration Platform" },
      {
        property: "og:description",
        content:
          "AI summaries, real-time chat, crystal clear video and smart analytics. Built for modern teams.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navbar />
      <Hero />
      <LogoCloud />
      <Features />
      <DashboardShowcase />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
