import React from "react";
import { Trophy, Flame, Timer } from "lucide-react";

export default function EngineCoreWidget({ profile }: { profile: any }) {
  return (
    <div className="flex flex-col justify-center items-center text-center bg-white/5 border border-white/10 p-6 rounded-2xl relative group min-h-[460px] shadow-sm hover:border-white/20 transition-colors col-span-12 lg:col-span-5">
      
      <div className="w-full flex flex-col items-center z-10">
        <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase flex items-center gap-1.5 mb-8">
          <Timer size={13} className="text-white" />
          Engine Core Standby
        </p>
        
        {/* Ultra-thin Visualizer Circle */}
        <div className="relative w-48 h-48 rounded-full flex items-center justify-center border-[1px] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-8">
          <div className="flex flex-col items-center justify-center z-10">
            <div className="text-5xl font-black text-white tracking-tighter leading-none select-none font-sans">
              25:00
            </div>
            <div className="text-[10px] font-bold tracking-widest text-zinc-400 mt-3 uppercase select-none">
              READY STATE
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed mb-8">
          Synchronized timer, tools and protocols are ready. Start to enter deep focus.
        </p>
        
        {/* Stats beneath */}
        <div className="w-full grid grid-cols-2 gap-3 pt-6 border-t border-white/10 text-center">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase flex items-center justify-center gap-1 mb-1">
              <Trophy size={10} className="text-zinc-400" />
              sessions
            </span>
            <span className="text-lg font-black text-white">{profile?.total_sessions || 0}</span>
          </div>
          <div className="flex flex-col border-l border-white/10">
            <span className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase flex items-center justify-center gap-1 mb-1">
              <Flame size={10} className="text-zinc-400" />
              focus streak
            </span>
            <span className="text-lg font-black text-white">{profile?.streak_days || 0} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
