"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const ParallaxNetwork = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Brutalist typography transforms
  const xText = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  // Network grid transforms
  const yGrid = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);

  return (
    <section ref={ref} className="relative min-h-[150vh] flex items-center justify-center border-b-[4px] border-[#333] bg-[#050505] overflow-hidden">
      
      {/* Background wireframe lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="20%" x2="100%" y2="80%" stroke="#FFF" strokeWidth="2" />
          <line x1="100%" y1="20%" x2="0" y2="80%" stroke="#FFF" strokeWidth="2" />
        </svg>
      </div>

      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row-reverse items-center justify-center p-8 gap-16 z-10">
        
        {/* Right Side (text): Brutalist Typography */}
        <motion.div 
          style={{ x: xText, opacity: opacityText }}
          className="flex-1 flex flex-col items-end text-right"
        >
          <div className="text-[10px] tracking-[0.3em] text-[#E1E0CC] mb-6 uppercase border border-[#E1E0CC] px-2 py-1 w-fit bg-black">
            Layer 02
          </div>
          <h2 
            className="text-6xl md:text-8xl font-playfair font-black italic uppercase tracking-tighter leading-none mb-4"
            style={{ textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)' }}
          >
            The Network
          </h2>
          <h3 className="text-2xl md:text-4xl font-light uppercase tracking-widest text-[#E1E0CC] mb-8 border-r-4 border-[#E1E0CC] pr-4">
            Global Sync
          </h3>
          <p className="max-w-md text-zinc-400 font-mono text-sm leading-relaxed">
            Connect across the globe. Join active study rooms, challenge peers on the leaderboard, and communicate through high-efficiency raw chat streams.
          </p>
        </motion.div>

        {/* Left Side: Overlapping Grids */}
        <motion.div 
          style={{ y: yGrid, opacity: opacityText }}
          className="flex-1 flex flex-col gap-6 w-full max-w-lg relative"
        >
          {/* Chat Mod */}
          <div className="border-4 border-[#333] bg-black p-6 relative ml-12 z-20 hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute -top-3 left-4 px-2 font-mono font-bold text-black bg-white uppercase text-xs">
              CHAT_MOD
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="font-mono text-sm text-[#E1E0CC]">[SYS]: User_93 joined room</span>
              </div>
              <div className="flex gap-2 items-center opacity-70">
                <div className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="font-mono text-sm text-zinc-500">[ALX]: Starting next cycle</span>
              </div>
            </div>
          </div>

          {/* Rooms Mod */}
          <div className="border-4 border-[#333] bg-black p-6 relative mr-12 z-10 -mt-10 hover:-translate-y-2 transition-transform duration-500">
            <div className="absolute -top-3 right-4 px-2 font-mono font-bold text-[#333] bg-[#E1E0CC] uppercase text-xs">
              ROOMS_MOD
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border border-white/20 p-4 flex flex-col gap-2">
                <span className="font-mono text-xs text-zinc-400">GLOBAL_01</span>
                <span className="font-black text-xl">124 ON</span>
              </div>
              <div className="border border-white/20 p-4 flex flex-col gap-2 bg-white/5">
                <span className="font-mono text-xs text-zinc-400">PRIVATE_XY</span>
                <span className="font-black text-xl">4 ON</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
