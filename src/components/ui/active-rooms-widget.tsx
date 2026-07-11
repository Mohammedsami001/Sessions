import React from "react";
import { Globe, PlusCircle, Lock, Clock } from "lucide-react";
import { computeTimerRemaining } from "@/lib/types";

export default function ActiveRoomsWidget({ rooms, participantCounts, handleQuickJoin, setShowCreateModal }: any) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl relative group p-5 shadow-sm hover:border-white/20 transition-colors w-full flex-1 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
            <span className="w-2 h-2 rounded-full bg-white/80"></span>
            Active Rooms
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Synchronized study sessions online</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-transparent border border-white/20 text-white hover:border-white px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={12} />
          Host Room
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-48 py-10">
            <div className="relative w-24 h-24 flex items-center justify-center mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-slow">
                <circle cx="50" cy="50" r="16" fill="url(#planet-grad)" />
                <ellipse cx="50" cy="50" rx="35" ry="10" transform="rotate(-20 50 50)" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <ellipse cx="50" cy="50" rx="35" ry="10" transform="rotate(20 50 50)" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <circle cx="80" cy="30" r="1.5" fill="white" className="animate-ping" />
                <circle cx="20" cy="70" r="1" fill="white" />
                <circle cx="30" cy="20" r="1" fill="white" />
                <defs>
                  <radialGradient id="planet-grad" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <p className="text-white text-sm font-bold mb-1">No active rooms right now.</p>
            <p className="text-zinc-500 text-xs font-medium max-w-[280px] mb-6">
              Be the pioneer and host a Room to start a deep focus session with others.
            </p>
            <div className="flex justify-between items-center text-xs w-full max-w-[90%] pt-4 border-t border-white/5">
              <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                <Globe size={12} /> Want to open a custom Room with friends?
              </span>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-white font-bold hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                Host custom room <span className="text-sm leading-none">→</span>
              </button>
            </div>
          </div>
        ) : (
          rooms.map((room: any) => {
            const timer = computeTimerRemaining(room.timer_started_at, room.timer_status, room.focus_duration, room.break_duration, room.long_break_duration);
            return (
              <div 
                key={room.id} 
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 transition-all duration-300"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] bg-white/10 border border-white/10 text-zinc-300 font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase">
                      {room.category}
                    </span>
                    {room.visibility === 'private' && (
                      <span className="text-[9px] bg-red-950/50 border border-red-500/20 text-red-400 font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase flex items-center gap-0.5">
                        <Lock size={8} /> PRIVATE
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm font-bold text-white tracking-wide">
                    {room.title}
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                      <span className="text-zinc-300">{participantCounts[room.id] || 0}</span> peers
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Clock size={10} />
                      {room.timer_status === 'idle' ? 'STANDBY' : `${String(timer.minutes).padStart(2,'0')}:${String(timer.seconds).padStart(2,'0')}`}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => handleQuickJoin(room.id)} 
                  className="w-full xl:w-auto bg-white/5 hover:bg-white text-zinc-400 hover:text-zinc-950 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center"
                >
                  ENTER
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
