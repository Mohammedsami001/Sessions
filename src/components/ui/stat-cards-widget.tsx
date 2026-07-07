import React from "react";
import { TrendingUp, Clock, Star } from "lucide-react";
import { formatFocusHours } from "@/lib/types";

export default function StatCardsWidget({ profile, levelInfo }: { profile: any, levelInfo: any }) {
  return (
    <div className="flex gap-4 w-full lg:w-auto h-full">
      {/* Level Card */}
      <div className="flex flex-col justify-center px-4 py-3 bg-zinc-950 rounded-2xl border border-white/10 min-w-[130px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <TrendingUp size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-medium">Level</span>
            <span className="text-lg font-bold text-white leading-tight flex items-center gap-1">
              {levelInfo?.level || 0}
              <span className="text-xs text-zinc-500">↑</span>
            </span>
            <span className="text-[9px] text-zinc-500 mt-0.5">Protocol Level</span>
          </div>
        </div>
      </div>
      
      {/* Total Focus Card */}
      <div className="flex flex-col justify-center px-4 py-3 bg-zinc-950 rounded-2xl border border-white/10 min-w-[150px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Clock size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-medium">Total Focus</span>
            <span className="text-lg font-bold text-white leading-tight">{formatFocusHours(profile?.total_focus_seconds || 0)}</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">This Session</span>
          </div>
        </div>
      </div>

      {/* Experience Card */}
      <div className="flex flex-col justify-center px-4 py-3 bg-zinc-950 rounded-2xl border border-white/10 min-w-[150px] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
            <Star size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-medium">Experience</span>
            <span className="text-lg font-bold text-white leading-tight">{profile?.exp || 0} XP</span>
            <span className="text-[9px] text-zinc-500 mt-0.5">Total Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
