import React from "react";
import { formatFocusHours } from "@/lib/types";

export default function UserStatsHeader({ profile, levelInfo }: { profile: any, levelInfo: any }) {
  return (
    <header className="relative mb-8 bg-zinc-950/50 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm">
      
      <div className="flex items-center gap-5 w-full lg:w-auto">
        <div className="relative shrink-0">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white flex items-center justify-center font-extrabold text-2xl text-zinc-950 select-none">
            {profile?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-zinc-950 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
        </div>
        
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight flex flex-wrap items-center gap-2">
            Welcome, <span className="font-semibold text-white">{profile?.display_name || 'Student'}</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Multiplayer Network Status: <span className="text-white font-bold">ACTIVE PROTOCOL</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
        <div className="flex flex-col items-center px-6 py-3 bg-white/5 rounded-xl border border-white/5 text-center shrink-0 min-w-[100px]">
          <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">LEVEL</span>
          <span className="text-lg font-black text-white tracking-wide mt-0.5">{levelInfo?.level || 0}</span>
        </div>
        
        <div className="flex flex-col items-center px-6 py-3 bg-white/5 rounded-xl border border-white/5 text-center shrink-0 min-w-[120px]">
          <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">TOTAL FOCUS</span>
          <span className="text-lg font-black text-white mt-0.5">{formatFocusHours(profile?.total_focus_seconds || 0)}</span>
        </div>

        <div className="flex flex-col items-center px-6 py-3 bg-white/5 rounded-xl border border-white/5 text-center shrink-0 min-w-[100px]">
          <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">EXPERIENCE</span>
          <span className="text-lg font-black text-white mt-0.5">{profile?.exp || 0} XP</span>
        </div>
      </div>
    </header>
  );
}
