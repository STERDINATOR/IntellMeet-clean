import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/lib/stores";
import { streamAI } from "@/lib/ai-stream";

const quick = [
  "Summarize my last meeting",
  "Generate tasks from Q4 strategy",
  "Find docs about Atlas Platform",
  "Create a project plan for launch",
];

const fallbackReply = (q: string) =>
  `Here's what I found for "${q}":\n\n- Pulled context from your workspace\n- Identified action items and risks\n- Suggested follow-ups assigned to relevant owners\n\nConnect MongoDB backend + OpenAI key for live streaming.`;

export function AICopilotFAB() {
  const { copilotOpen, setCopilotOpen } = useUIStore();
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi Alex, I'm your IntellMeet Copilot. Ask me anything about your workspace." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const aiIndex = messages.length + 1;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: "" }]);
    setInput("");
    setTyping(true);
    try {
      await streamAI({
        path: "/ai/copilot/stream",
        body: { prompt: text },
        onDelta: (delta) => setMessages((m) => m.map((item, index) => index === aiIndex ? { ...item, text: item.text + delta } : item)),
      });
    } catch {
      setMessages((m) => m.map((item, index) => index === aiIndex ? { ...item, text: fallbackReply(text) } : item));
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setCopilotOpen(!copilotOpen)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-2xl gradient-primary glow flex items-center justify-center text-primary-foreground shadow-xl hover:scale-105 transition-transform"
        aria-label="AI Copilot"
      >
        {copilotOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-8rem)] rounded-2xl glass elevated flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">AI Copilot</div>
                <div className="text-[10px] text-muted-foreground">Powered by IntellMeet AI</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {m.text || (typing && i === messages.length - 1 ? "Thinking..." : "")}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex"><div className="bg-secondary rounded-2xl px-3 py-2 text-sm flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce delay-200" />
                </div></div>
              )}
            </div>

            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quick.map((q) => (
                <button key={q} onClick={() => send(q)} className="text-[11px] px-2 py-1 rounded-full bg-secondary hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition flex items-center gap-1">
                  <Wand2 className="h-2.5 w-2.5" />{q}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 border-t border-border/50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot anything..."
                className="flex-1 bg-secondary/60 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/40"
              />
              <Button size="icon" type="submit" className="gradient-primary text-primary-foreground border-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
