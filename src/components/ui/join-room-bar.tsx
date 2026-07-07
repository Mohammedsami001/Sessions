import React from "react";
import { LogIn } from "lucide-react";

interface JoinRoomBarProps {
  joinCode: string;
  setJoinCode: (code: string) => void;
  handleJoinByCode: (e: React.FormEvent) => void;
  joinError: string;
}

export default function JoinRoomBar({ joinCode, setJoinCode, handleJoinByCode, joinError }: JoinRoomBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center bg-white/5 border border-white/10 p-4 rounded-xl shadow-inner max-w-2xl hover:border-white/20 transition-colors">
      <div className="relative flex-1">
        <input 
          type="text" 
          placeholder="Enter Room Join Code..." 
          value={joinCode} 
          onChange={e => setJoinCode(e.target.value)} 
          className="w-full bg-zinc-950 border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/10 px-4 py-3 rounded-lg text-white font-medium text-sm placeholder:text-zinc-500 outline-none transition-all duration-300"
        />
      </div>
      <button 
        onClick={handleJoinByCode} 
        className="bg-white hover:bg-zinc-200 border border-white text-zinc-950 px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer transition-all duration-300 shrink-0"
      >
        <LogIn size={16} />
        Join Session
      </button>
      {joinError && (
        <span className="text-xs text-red-400 font-semibold bg-red-950/50 border border-red-500/20 px-3 py-2 rounded-lg animate-shake sm:max-w-xs text-center shrink-0">
          {joinError}
        </span>
      )}
    </div>
  );
}
