import React from "react";
import { User, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function UserStatsHeader({ profile }: { profile: any }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="relative mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      
      <div className="flex items-center gap-5 w-full sm:w-auto">
        <div className="relative shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white flex items-center justify-center font-extrabold text-2xl text-zinc-950 select-none">
            {profile?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-950"></span>
        </div>
        
        <div className="flex flex-col">
          <p className="text-xs md:text-sm text-zinc-400">Welcome back,</p>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight flex items-center gap-2 uppercase">
            {profile?.display_name || 'Student'} <span className="text-xl">👋</span>
          </h1>
          <p className="text-[10px] md:text-xs text-zinc-500 mt-1">
            Multiple Participants. One Focus. Active Protocol.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent border border-white/10 text-white font-semibold text-xs hover:bg-white/5 transition-colors">
          <User size={14} />
          Profile
        </button>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-semibold text-xs transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </header>
  );
}
