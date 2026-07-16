"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const ParallaxData = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Brutalist typography transforms
  const yText = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);

  // Data elements transforms
  const scaleData = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} className="relative min-h-[150vh] flex items-center justify-center border-b-[4px] border-[#333] bg-[#050505] overflow-hidden">
      
      {/* Background brutalist crosses */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
           style={{ 
             backgroundImage: 'radial-gradient(circle at center, #FFF 2px, transparent 2px)',
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center p-8 gap-16 z-10">
        
        {/* Left Side: Brutalist Typography */}
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="flex-1 flex flex-col"
        >
          <div className="text-[10px] tracking-[0.3em] text-[#E1E0CC] mb-6 uppercase border border-[#E1E0CC] px-3 py-1 w-fit bg-black rounded-full">
            Layer 03
          </div>
          <h2 
            className="text-6xl md:text-8xl font-playfair font-black italic uppercase tracking-tighter leading-none mb-4"
            style={{ textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)' }}
          >
            The Metrics
          </h2>
          <h3 className="text-2xl md:text-4xl font-light uppercase tracking-widest text-[#E1E0CC] mb-8 border-l-4 border-[#E1E0CC] pl-4">
            Performance Telemetry
          </h3>
          <p className="max-w-md text-zinc-400 font-mono text-sm leading-relaxed">
            Every second logged. Every task tracked. Rank up on the global leaderboard with raw, unstyled telemetry that prioritizes function over form.
          </p>
        </motion.div>

        {/* Right Side: Brutalist Data Visuals */}
        <motion.div 
          style={{ scale: scaleData, opacity: opacityText }}
          className="flex-1 flex flex-col gap-8 w-full max-w-lg relative"
        >
          {/* Leaderboard Mod */}
          <div className="border-4 border-[#333] bg-black p-6 relative hover:border-white transition-colors duration-300 rounded-3xl">
            <div className="absolute -top-3 right-6 px-3 font-mono font-bold text-black bg-white uppercase text-xs rounded-full">
              LEADERBOARD_MOD
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {[
                { rank: "01", name: "ALEX_99", xp: "14,020" },
                { rank: "02", name: "SYS_ADMIN", xp: "13,950" },
                { rank: "03", name: "GUEST_4", xp: "11,100" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center border-b border-[#333] pb-2 font-mono">
                  <div className="flex gap-4">
                    <span className="text-[#E1E0CC] font-bold">{row.rank}</span>
                    <span className="text-white uppercase">{row.name}</span>
                  </div>
                  <span className="text-zinc-500 text-sm">XP_{row.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Mod */}
          <div className="border-4 border-[#333] bg-[#E1E0CC] p-6 relative ml-12 text-black hover:bg-white transition-colors duration-300 rounded-3xl">
            <div className="absolute -top-3 left-6 px-3 font-mono font-bold text-white bg-black uppercase text-xs rounded-full">
              TASKS_MOD
            </div>
            <div className="flex flex-col gap-3 mt-4 font-mono font-bold">
              <div className="flex gap-3 items-center">
                <div className="w-4 h-4 border-2 border-black flex items-center justify-center bg-black">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="line-through opacity-50">Complete Architecture Phase</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-4 h-4 border-2 border-black" />
                <span>Initialize Sequence</span>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-4 h-4 border-2 border-black" />
                <span>Run Final Diagnostics</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
