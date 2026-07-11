import React, { useState, useEffect } from "react";
import { Target, Flame, Play, Pause } from "lucide-react";

export default function EngineCoreWidget({ profile, onSessionComplete }: { profile: any, onSessionComplete?: (minutes: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPlaying(false);
            if (onSessionComplete) {
              onSessionComplete(25); // Hardcoded 25 minutes for now
            }
            return 25 * 60; // reset
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isPlaying && timeLeft !== 0) {
      // paused
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft, onSessionComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeElement = document.activeElement;
        if (
          activeElement && 
          (activeElement.tagName === 'INPUT' || 
           activeElement.tagName === 'TEXTAREA' || 
           (activeElement as HTMLElement).isContentEditable)
        ) {
          return;
        }
        e.preventDefault(); 
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div data-testid="engine-core-widget" className="flex flex-col bg-[#0a0a0a] border border-white/10 p-5 rounded-2xl relative group h-full shadow-sm hover:border-white/20 transition-colors flex-1">
      
      <div className="w-full flex flex-col z-10 h-full">
        <div className="flex justify-between items-center mb-8">
          <p className="text-[10px] text-white font-bold tracking-widest uppercase flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-white/80'}`}></span>
            {isPlaying ? 'Engine Core Active' : 'Engine Core Standby'}
          </p>
          <div className="text-[10px] text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded-sm">
            Press SPACE
          </div>
        </div>
        
        {/* Ultra-thin Visualizer Circle */}
        <div className="flex flex-col items-center justify-center flex-1 w-full relative">
          <div className={`relative w-40 h-40 rounded-full flex items-center justify-center border-2 border-white/10 mb-6 transition-transform ${isPlaying ? 'scale-[1.02]' : ''}`}>
            <div className={`absolute inset-0 rounded-full border-[3px] border-white border-t-transparent border-l-transparent transform ${isPlaying ? 'animate-spin opacity-40' : 'rotate-45 opacity-20'}`}></div>
            <div className={`absolute inset-0 rounded-full border-[3px] border-white border-b-transparent border-l-transparent transform ${isPlaying ? 'animate-spin-slow opacity-80' : '-rotate-12 opacity-80'}`}></div>
            
            <div className="flex flex-col items-center justify-center z-10 mt-1 cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
              <div className="text-4xl font-black text-white tracking-tighter leading-none select-none font-sans">
                {timeDisplay}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-zinc-400 hover:text-white transition-colors">
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span className="text-xs font-semibold select-none">
                  {isPlaying ? 'Pause' : 'Start'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-500 max-w-[220px] leading-relaxed mb-6 text-center h-8">
            {isPlaying ? 'Deep focus initiated. Stay on track.' : 'Synchronized timer, tools and protocols are ready.'}
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
