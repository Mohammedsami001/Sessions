import React from "react";
import Link from "next/link";
import { LayoutDashboard, User, Globe, Settings, Hexagon } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-[250px] h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 z-40">
      
      {/* Brand / Logo */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <Hexagon className="text-white fill-white/10" size={24} />
        <span className="text-white font-black tracking-widest uppercase text-sm">
          Sessions
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 text-white font-semibold text-sm transition-colors border border-white/10"
        >
          <LayoutDashboard size={18} className="text-white" />
          Dashboard
        </Link>
        
        <Link 
          href="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <User size={18} />
          Profile
        </Link>

        <Link 
          href="/rooms"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <Globe size={18} />
          Browse Rooms
        </Link>

        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>

      {/* Optional Pro Teaser or Footer in sidebar */}
      <div className="mt-auto pt-6 border-t border-zinc-900">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col items-start gap-2">
          <span className="text-xs font-black tracking-widest text-white uppercase">Go Pro</span>
          <p className="text-[10px] text-zinc-500 font-medium">Unlock ambient mixer & custom themes.</p>
          <button className="mt-2 text-xs font-semibold text-zinc-950 bg-white hover:bg-zinc-200 w-full py-2 rounded-lg transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

    </aside>
  );
}
