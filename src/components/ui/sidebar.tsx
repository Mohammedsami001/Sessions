import React from "react";
import Link from "next/link";
import { LayoutDashboard, User, Globe, Settings, Hexagon, CheckCircle, Crown, Play, Pause, SkipBack, SkipForward, Disc3 } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-[250px] h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 z-40 overflow-y-auto hide-scrollbar">
      
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 mb-8 pl-2 shrink-0">
        <Hexagon className="text-white fill-white/10" size={24} />
        <div className="flex flex-col">
          <span className="text-white font-bold tracking-tight text-sm">
            Sessions
          </span>
          <span className="text-zinc-500 text-[10px]">Study OS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 shrink-0 mb-8">
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 text-white font-semibold text-sm transition-colors border border-white/10"
        >
          <LayoutDashboard size={18} className="text-white" />
          Dashboard
        </Link>
        
        <Link 
          href="/profile"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <User size={18} />
          Profile
        </Link>
        
        <Link 
          href="/tasks"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <CheckCircle size={18} />
          Global Tasks
        </Link>

        <Link 
          href="/rooms"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <Globe size={18} />
          Browse Rooms
        </Link>

        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>

      {/* Widgets Area */}
      <div className="mt-auto flex flex-col gap-4">
        
        {/* Go Pro Widget */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col items-start gap-2 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={16} className="text-white" />
            <span className="text-sm font-bold text-white">Go Pro</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
            Unlock ambient mixer, custom themes and more.
          </p>
          <button className="mt-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1">
            Upgrade Now <span className="text-lg leading-none">→</span>
          </button>
        </div>

        {/* Lo-fi Focus Widget */}
        <div className="bg-zinc-950 border border-white/10 p-4 rounded-2xl flex flex-col gap-4 shadow-sm group">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
              <Disc3 size={20} className="text-white animate-spin-slow" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">Lo-fi Focus</span>
              <span className="text-[10px] text-zinc-500 truncate">Chillhop Essentials</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Visualizer bars */}
            <div className="flex items-end justify-center gap-1 h-6">
              {[4, 8, 5, 3, 10, 6, 9, 4, 7, 3, 8, 5, 10, 6, 3, 5, 8, 4].map((h, i) => (
                <div key={i} className="w-1 bg-white/30 rounded-full" style={{ height: `${h * 10}%` }}></div>
              ))}
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 text-white">
              <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={14} fill="currentColor" /></button>
              <button className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"><Pause size={14} fill="currentColor" /></button>
              <button className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={14} fill="currentColor" /></button>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 shrink-0 text-[10px] text-zinc-600 font-medium pl-1">
        <p>© Sessions Study OS</p>
        <p>v1.0.0</p>
      </div>

    </aside>
  );
}
