"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const ParallaxTrack = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black text-white selection:bg-[#E1E0CC] selection:text-black font-sans"
    >
      {/* Brutalist structural background grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
           style={{ 
             backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
             backgroundSize: '100px 100px'
           }} 
      />
      
      {/* Scroll Progress Indicator - Brutalist style */}
      <motion.div 
        className="fixed top-0 left-0 w-full h-2 bg-[#E1E0CC] z-50 transform origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
