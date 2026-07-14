"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Pause, Headphones } from "lucide-react";

export const ParallaxEngineCore = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Brutalist typography transforms
  const yText = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  // Visualizer transforms
  const scaleVisuals = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <section ref={ref} className="relative min-h-[150vh] flex items-center justify-center border-b-[4px] border-[#333]">
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center p-8 gap-16">
        
        {/* Left Side: Brutalist Typography */}
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="flex-1 flex flex-col"
        >
          <div className="text-[10px] tracking-[0.3em] text-[#E1E0CC] mb-6 uppercase border border-[#E1E0CC] px-2 py-1 w-fit bg-black">
            Layer 01
          </div>
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-4">
            The Engine Core
          </h2>
          <h3 className="text-2xl md:text-4xl font-light uppercase tracking-widest text-[#E1E0CC] mb-8 border-l-4 border-[#E1E0CC] pl-4">
            Synchronized Focus
          </h3>
          <p className="max-w-md text-zinc-400 font-mono text-sm leading-relaxed">
            A mechanical heartbeat for your productivity. Deep work is synchronized across the network. Audio environments are engineered to drown out the noise.
          </p>
        </motion.div>

        {/* Right Side: Mechanical Visualizers */}
        <motion.div 
          style={{ scale: scaleVisuals, opacity: opacityText }}
          className="flex-1 flex flex-col gap-8 w-full max-w-lg"
        >
          {/* Brutalist Timer */}
          <div className="border-4 border-[#333] bg-black p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-[#333] bg-[#E1E0CC]">TIMER_MOD</div>
            <InteractiveBrutalistTimer />
          </div>

          {/* Brutalist Audio */}
          <div className="border-4 border-[#333] bg-black p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-black bg-white">AUDIO_MOD</div>
            <InteractiveBrutalistAudio />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

/* --- Interactive Micro-components --- */

const InteractiveBrutalistTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500);

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
    <div className="flex flex-col gap-4 mt-6">
      <div className="text-7xl font-black tracking-tighter font-mono">
        {mins}<span className="text-[#333]">:</span>{secs}
      </div>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="border-2 border-white text-white font-black uppercase py-4 hover:bg-white hover:text-black transition-colors flex justify-center items-center gap-2"
      >
        {isRunning ? "HALT" : "IGNITE"}
      </button>
    </div>
  );
};

const InteractiveBrutalistAudio = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div data-testid="audio-visualizer" className="flex items-end gap-1 h-16 w-full border-b-2 border-[#333] pb-1">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? { height: ["20%", "100%", "40%", "90%", "20%"] } : { height: "10%" }}
            transition={isPlaying ? { duration: 0.8, repeat: Infinity, delay: i * 0.05, ease: "linear" } : { duration: 0.2 }}
            className="flex-1 bg-[#E1E0CC]"
          />
        ))}
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center justify-between border-2 border-white px-4 py-3 font-mono font-bold uppercase hover:bg-white hover:text-black transition-colors"
      >
        <span>{isPlaying ? "MUTE ENVIRONMENT" : "ACTIVATE ENVIRONMENT"}</span>
        <Headphones size={20} />
      </button>
    </div>
  );
};
