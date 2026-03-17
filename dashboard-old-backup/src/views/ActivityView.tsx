// Copyright 2026 Danish A. Licensed under Apache-2.0.
// ActivityView — recent activity feed extracted from App.tsx.

import { Clock } from 'lucide-react';
import type { ActivityEvent } from '../hooks/useAgentData';

export interface ActivityViewProps {
  activity: ActivityEvent[];
}

export function ActivityView({ activity }: ActivityViewProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
        <h2 className="text-lg font-bold tracking-tight">Recent Activity</h2>
      </div>
      {activity.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 text-center">
          <Clock className="w-10 h-10 text-[#5a6480]/30 mx-auto mb-3" />
          <p className="text-sm text-[#8892b0]">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {activity.map((event, i) => (
            <div key={event.id || i} className="flex items-start gap-3 px-4 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${event.type.includes('sent') || event.type.includes('success') ? 'bg-[#85c742]' : event.type.includes('fail') ? 'bg-red-400' : 'bg-[#5a6480]'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{event.message}</p>
                {event.detail && <p className="text-xs text-[#5a6480] mt-0.5 truncate">{event.detail}</p>}
              </div>
              <span className="text-xs text-[#5a6480] shrink-0">{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
