import React from "react";
import { Globe, PlusCircle, Lock, Clock } from "lucide-react";
import { computeTimerRemaining } from "@/lib/types";

export default function ActiveRoomsWidget({ rooms, participantCounts, handleQuickJoin, setShowCreateModal }: any) {
  return (
    <div className="flex flex-col min-h-[460px] bg-white/5 border border-white/10 rounded-2xl relative group p-6 shadow-sm hover:border-white/20 transition-colors col-span-12 lg:col-span-7">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
            <Globe size={16} className="text-zinc-400" />
            Active Multiplayer Rooms
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{rooms.length} synchronized sessions</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="bg-white text-zinc-950 hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
        >
          <PlusCircle size={12} />
          Host
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-48 py-10 opacity-70">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4 border border-white/5 relative">
              <Globe size={18} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500/20 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-white text-sm font-bold mb-1">No active rooms right now.</p>
            <p className="text-zinc-500 text-xs font-medium max-w-[260px] mb-6">
              Be the pioneer and host a Room to start a deep focus session with others.
            </p>
            <div className="flex flex-col gap-2 items-center text-xs w-full max-w-sm pt-4 border-t border-white/5">
              <span className="text-zinc-500 font-medium">Want to open a custom Room with friends?</span>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="text-white font-bold hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                Host custom room <span className="text-lg leading-none">→</span>
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
