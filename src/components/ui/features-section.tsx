"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

const modules = [
  {
    id: "MOD_TIMER",
    title: "Synchronized Timers",
    description:
      "Join live rooms with synchronized Pomodoro intervals. Everyone works and breaks at the exact same time, enforcing collective accountability.",
  },
  {
    id: "MOD_AUDIO",
    title: "Atmospheric Control",
    description:
      "Curated lo-fi audio streams embedded directly in the environment to drown out distractions and induce state-dependent memory.",
  },
  {
    id: "MOD_STATS",
    title: "Performance Telemetry",
    description:
      "Track your focus sessions, maintain streaks, and visualize your deep work patterns over time with gamified analytics.",
  },
];

export const FeaturesSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate playhead height (0 to 100%)
  const playheadHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="relative w-full bg-black text-white font-sans py-20 md:py-32" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 relative">
          
          {/* Left Sticky Sidebar */}
          <div className="md:w-1/3 flex-shrink-0 relative">
            <div className="sticky top-32 flex">
              {/* Playhead Track */}
              <div className="w-px h-64 bg-white/10 mr-6 relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 left-0 w-full bg-[#E1E0CC]"
                  style={{ height: playheadHeight }}
                />
              </div>
              
              <div>
                <div className="text-[10px] tracking-widest text-[#E1E0CC] uppercase mb-4 opacity-80">
                  Documentation
                </div>
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">
                  System Capabilities
                </h2>
                <p className="text-[#a3a3a3] text-sm md:text-base leading-relaxed">
                  A high-performance environment engineered to eliminate friction. 
                  Every module serves a single purpose: absolute flow.
                </p>
              </div>
            </div>
          </div>

          {/* Right Scrolling Content */}
          <div className="md:w-2/3 flex flex-col gap-32 pb-32 pt-16 md:pt-32">
            {modules.map((mod, index) => (
              <FeatureModule key={mod.id} mod={mod} index={index} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

const FeatureModule = ({ mod, index }: { mod: any; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`border-t border-white/10 pt-8 transition-opacity duration-700 ${
        isInView ? "opacity-100" : "opacity-40"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#E1E0CC]/70 border border-[#E1E0CC]/20 px-2 py-1 rounded-sm">
            {mod.id}
          </span>
          <span className="text-white/20 font-mono text-sm">
            0{index + 1}
          </span>
        </div>
        
        <h3 className="text-2xl md:text-4xl font-medium tracking-tight mt-4">
          {mod.title}
        </h3>
        
        <p className="text-[#a3a3a3] md:text-lg leading-relaxed mt-2 max-w-xl">
          {mod.description}
        </p>

        {/* Abstract Visualization Box */}
        <div className="mt-8 h-48 md:h-64 w-full bg-white/5 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden relative">
          {mod.id === "MOD_TIMER" && <TimerVis isActive={isInView} />}
          {mod.id === "MOD_AUDIO" && <AudioVis isActive={isInView} />}
          {mod.id === "MOD_STATS" && <StatsVis isActive={isInView} />}
        </div>
      </div>
    </motion.div>
  );
};

const TimerVis = ({ isActive }: { isActive: boolean }) => (
  <div className="flex items-center gap-2">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ height: 8 }}
        animate={{ height: isActive ? (i === 3 ? 16 : 48) : 8 }}
        transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
        className={`w-1 rounded-full ${i === 3 ? "bg-white/30" : "bg-[#E1E0CC]"}`}
      />
    ))}
  </div>
);

const AudioVis = ({ isActive }: { isActive: boolean }) => (
  <div className="flex items-center gap-1.5 h-16">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        animate={isActive ? {
          height: ["20%", "100%", "40%", "80%", "20%"],
        } : { height: "10%" }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.1,
        }}
        className="w-1.5 bg-[#E1E0CC]/60 rounded-full"
      />
    ))}
  </div>
);

const StatsVis = ({ isActive }: { isActive: boolean }) => (
  <div className="grid grid-cols-7 gap-1.5">
    {[...Array(28)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.1 }}
        animate={{ opacity: isActive ? (Math.random() > 0.5 ? 0.8 : 0.3) : 0.1 }}
        transition={{ duration: 0.5, delay: i * 0.02 }}
        className="w-3 h-3 md:w-4 md:h-4 bg-[#E1E0CC] rounded-sm"
      />
    ))}
  </div>
);
