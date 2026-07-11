import React from "react";
import { Trophy, Crown } from "lucide-react";
import type { Profile } from "../../lib/types";

interface Participant {
  id: string;
  role?: string;
  profile?: Profile | null;
  [key: string]: unknown;
}

export default function RoomLeaderboardWidget({ participants }: { participants: Participant[] }) {
  const sortedParticipants = [...participants].sort((a, b) => (b.profile?.exp || 0) - (a.profile?.exp || 0));

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl relative group p-5 shadow-sm hover:border-white/20 transition-colors w-full flex-1 min-h-[300px]" data-testid="room-leaderboard-widget">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
          <Trophy size={16} className="text-gold" />
          Room Leaderboard
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {sortedParticipants.map((p, index) => (
          <div key={p.id} data-testid="leaderboard-item" className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-gold text-black' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-zinc-400'}`}>
                {index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  {p.profile?.display_name || 'Unknown'}
                  {p.role === 'host' && <span className="text-[9px] bg-red-950/50 text-red-400 px-1.5 py-0.5 rounded tracking-widest uppercase">HOST</span>}
                </span>
                <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">
                  {p.profile?.exp || 0} EXP
                </span>
              </div>
            </div>
            {index === 0 && <Crown size={16} className="text-gold animate-pulse-slow" />}
          </div>
        ))}
        {sortedParticipants.length === 0 && (
          <div className="text-center py-6 text-zinc-500 text-sm">No participants yet.</div>
        )}
      </div>
    </div>
  );
}
