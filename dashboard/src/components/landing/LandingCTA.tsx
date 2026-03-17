import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/shared/ScrollReveal";

export default function LandingCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 md:py-32" style={{ background: "#0A0A0B", borderTop: "1px solid rgba(255,78,0,0.06)" }}>
      <ScrollReveal>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white text-balance">
            Ready to build?
          </h2>
          <p className="mb-8" style={{ color: "hsl(240 5% 50%)" }}>
            See every agent capability live in the dashboard.
          </p>
          <Button
            onClick={() => {
              localStorage.setItem("aerofyta_visited", "true");
              navigate("/dashboard");
            }}
            className="h-12 px-8 text-sm font-medium bg-primary hover:bg-primary/90 active:scale-[0.97] transition-all"
            style={{
              boxShadow: "0 0 24px rgba(255,78,0,0.3)",
              animation: "cta-pulse 3s ease-in-out infinite",
            }}
          >
            Open Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="mt-8 text-xs" style={{ color: "hsl(240 5% 30%)" }}>
            Powered by Tether WDK
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}
