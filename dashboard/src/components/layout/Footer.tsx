import { Github } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/40 py-4 px-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
    <span>Built with Tether WDK</span>
    <span className="opacity-40">·</span>
    <span>Apache 2.0</span>
    <span className="opacity-40">·</span>
    <code className="font-mono text-[11px] bg-muted/50 px-1.5 py-0.5 rounded">npm install @xzashr/aerofyta</code>
    <span className="opacity-40">·</span>
    <a
      href="https://github.com/xzashr/aerofyta"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
    >
      <Github className="h-3.5 w-3.5" />
    </a>
  </footer>
);

export default Footer;
