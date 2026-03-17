import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800/30 bg-[#171717]/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-orange-500/10">
              <Zap className="w-3 h-3 text-orange-500" />
            </div>
            <span className="font-medium text-neutral-400">AeroFyta</span>
            <span className="text-neutral-600">Powered by Tether WDK</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-600">
            <span>43 services</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>230+ endpoints</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span>Apache 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
