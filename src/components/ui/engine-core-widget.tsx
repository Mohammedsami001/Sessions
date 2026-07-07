import React from "react";
import { Target, Flame, Timer } from "lucide-react";

export default function EngineCoreWidget({ profile }: { profile: any }) {
  return (
    <div className="flex flex-col bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl relative group h-full shadow-sm hover:border-white/20 transition-colors flex-1">
      
      <div className="w-full flex flex-col z-10 h-full">
        <p className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center gap-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-white/80"></span>
          Engine Core Standby
        </p>
        
        {/* Ultra-thin Visualizer Circle */}
        <div className="flex flex-col items-center justify-center flex-1 w-full">
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center border-2 border-white/10 mb-6">
            <div className="absolute inset-0 rounded-full border-[3px] border-white border-t-transparent border-l-transparent rounded-full transform rotate-45 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-white border-b-transparent border-l-transparent rounded-full transform -rotate-12 opacity-80"></div>
            
            <div className="flex flex-col items-center justify-center z-10 mt-1">
              <div className="text-4xl font-black text-white tracking-tighter leading-none select-none font-sans">
                25:00
              </div>
              <div className="text-xs font-semibold text-zinc-400 mt-2 select-none">
                Focus Session
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed mb-6 text-center">
            Synchronized timer, tools and protocols are ready. Start to enter deep focus.
          </p>
        </div>
        
        {/* Stats beneath */}
        <div className="w-full grid grid-cols-2 pt-5 border-t border-white/5">
          <div className="flex flex-col items-start px-2">
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wide flex items-center gap-1.5 mb-1">
              <Target size={12} className="text-white" />
              Sessions
            </span>
            <span className="text-base font-black text-white pl-[18px]">{profile?.total_sessions || 0}</span>
          </div>
          <div className="flex flex-col items-start border-l border-white/10 pl-6 px-2">
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wide flex items-center gap-1.5 mb-1">
              <Flame size={12} className="text-white" />
              Focus Streak
            </span>
            <span className="text-base font-black text-white pl-[18px]">{profile?.streak_days || 0} Day{profile?.streak_days !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
