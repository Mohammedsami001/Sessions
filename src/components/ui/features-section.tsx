"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Headphones, Activity } from "lucide-react";

export const FeaturesSection = () => {
  return (
    <section className="relative w-full bg-black text-white py-32" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-[10px] tracking-widest text-[#E1E0CC] uppercase mb-4 opacity-80 font-mono border border-white/10 px-3 py-1 rounded-full bg-white/5"
          >
            System Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight font-sans text-white mb-6"
          >
            Engineered for absolute flow.
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Synchronized Timers */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-1 lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden relative group hover:bg-white/[0.07] transition-colors"
          >
            <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-[#E1E0CC]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col h-full justify-between z-10 relative">
              <div className="mb-12">
                <h3 className="text-2xl font-medium mb-3">Synchronized Timers</h3>
                <p className="text-zinc-400 text-sm max-w-md">
                  Join live rooms with synchronized Pomodoro intervals. Everyone works and breaks at the exact same time, enforcing collective accountability.
                </p>
              </div>

              {/* Interactive Sneak Peek: Mini Timer */}
              <InteractiveTimer />
            </div>
          </motion.div>

          {/* Card 2: Atmospheric Control */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="col-span-1 bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden relative group hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex flex-col h-full justify-between z-10 relative">
              <div className="mb-12">
                <h3 className="text-2xl font-medium mb-3">Atmospheric Control</h3>
                <p className="text-zinc-400 text-sm">
                  Curated lo-fi audio streams embedded directly to drown out distractions.
                </p>
              </div>

              {/* Interactive Sneak Peek: Audio Toggle */}
              <InteractiveAudio />
            </div>
          </motion.div>

          {/* Card 3: Performance Telemetry */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-span-1 md:col-span-2 lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden relative group hover:bg-white/[0.07] transition-colors"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center z-10 relative">
                <div>
                  <h3 className="text-2xl font-medium mb-3">Performance Telemetry</h3>
                  <p className="text-zinc-400 text-sm max-w-md">
                    Track your focus sessions, maintain streaks, and visualize your deep work patterns over time with gamified analytics.
                  </p>
                </div>
                
                {/* Interactive Sneak Peek: Stats Chart */}
                <InteractiveStats />
             </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

/* --- Interactive Micro-components --- */

const InteractiveTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-6 bg-black/40 border border-white/5 p-4 rounded-2xl w-fit backdrop-blur-md">
      <div className="text-4xl font-mono tracking-tighter text-[#E1E0CC] w-32">
        {mins}:{secs}
      </div>
      <button
        aria-label="start timer"
        onClick={() => setIsRunning(!isRunning)}
        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
      >
        {isRunning ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-1" />}
      </button>
    </div>
  );
};

const InteractiveAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-1 h-12 px-2">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? { height: ["20%", "100%", "30%", "80%", "20%"] } : { height: "15%" }}
            transition={isPlaying ? { duration: 1.2, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" } : { duration: 0.3 }}
            className="w-2 bg-[#E1E0CC]/80 rounded-t-sm"
          />
        ))}
      </div>
      <button
        aria-label="toggle audio"
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-3 rounded-xl w-fit hover:bg-white/10 transition-colors"
      >
        <Headphones size={18} className="text-[#E1E0CC]" />
        <span className="text-sm font-medium">{isPlaying ? "Pause Lo-Fi" : "Play Lo-Fi"}</span>
      </button>
    </div>
  );
};

const InteractiveStats = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Fake chart data
  const data = [40, 65, 30, 85, 55, 90, 100, 70, 45, 80];

  return (
    <div data-testid="stats-chart" className="flex items-end gap-2 h-32 w-full bg-black/40 border border-white/5 rounded-2xl p-6 relative">
      {data.map((val, i) => (
        <div 
          key={i} 
          className="flex-1 flex flex-col items-center gap-2 group relative"
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Tooltip */}
          {hoveredIndex === i && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-10 bg-white text-black text-xs font-bold py-1 px-2 rounded"
            >
              {val}m
            </motion.div>
          )}
          {/* Bar */}
          <motion.div
            initial={{ height: "10%" }}
            whileInView={{ height: `${val}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
            className={`w-full rounded-t-sm transition-colors duration-300 ${hoveredIndex === i ? 'bg-[#E1E0CC]' : 'bg-white/20'}`}
          />
        </div>
      ))}
    </div>
  );
};
