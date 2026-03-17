import { Radio, Brain, Zap, TrendingUp } from "lucide-react";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { useEffect, useRef, useState } from "react";

const steps = [
  { icon: Radio, word: "Watch", desc: "Monitor on-chain events and social signals in real time." },
  { icon: Brain, word: "Decide", desc: "Three agents deliberate using wallet state as context." },
  { icon: Zap, word: "Execute", desc: "Atomic HTLC transactions across nine blockchains." },
  { icon: TrendingUp, word: "Learn", desc: "Adapt strategies from outcomes and market feedback." },
];

export default function HowItWorks() {
  const lineRef = useRef<HTMLDivElement>(null);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLineVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-32" style={{ background: "#0A0A0B", borderTop: "1px solid rgba(255,78,0,0.06)" }}>
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center text-white text-balance">
            How It Works
          </h2>
        </ScrollReveal>

        <div className="relative" ref={lineRef}>
          {/* Animated dashed line */}
          <svg
            className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px overflow-visible"
            style={{ width: "76%" }}
            preserveAspectRatio="none"
          >
            <line
              x1="0" y1="0" x2="100%" y2="0"
              stroke="rgba(255,78,0,0.3)"
              strokeWidth="1"
              strokeDasharray="6 6"
              strokeDashoffset={lineVisible ? "0" : "800"}
              style={{
                transition: "stroke-dashoffset 2s ease-out",
              }}
            />
          </svg>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <ScrollReveal key={step.word} delay={i * 120}>
                <div className="text-center relative">
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10"
                    style={{
                      background: "rgba(255,78,0,0.06)",
                      border: "1px solid rgba(255,78,0,0.15)",
                      boxShadow: i === 0 ? "0 0 20px rgba(255,78,0,0.15)" : "none",
                    }}
                  >
                    <step.icon className="h-8 w-8" strokeWidth={1.5} style={{ color: "#FF4E00" }} />
                  </div>
                  <h3 className="font-heading text-sm font-semibold mb-1.5 text-white">{step.word}</h3>
                  <p className="text-xs leading-relaxed max-w-[180px] mx-auto" style={{ color: "hsl(240 5% 50%)" }}>
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
