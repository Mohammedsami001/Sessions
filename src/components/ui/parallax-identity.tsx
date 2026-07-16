"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const ParallaxIdentity = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"] // ends when section hits the bottom
  });

  // Brutalist typography transforms
  const scaleText = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8, 1], [0, 1, 1]);
  const opacityBg = useTransform(opacityText, v => v * 0.05);
  const yContent = useTransform(scrollYProgress, [0, 1], ["50%", "0%"]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden z-20 pb-32">
      
      {/* Background massive branding */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <motion.div 
          style={{ scale: scaleText, opacity: opacityBg }}
          className="text-[20vw] font-black text-white whitespace-nowrap"
        >
          SESSIONS
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        <motion.div 
          style={{ y: yContent, opacity: opacityText }}
          className="flex flex-col items-center"
        >
          <div className="text-[10px] tracking-[0.3em] text-[#E1E0CC] mb-6 uppercase border border-[#E1E0CC] px-3 py-1 w-fit bg-black rounded-md">
            Onboarding
          </div>
          <h2 
            className="text-6xl md:text-9xl font-playfair font-black italic uppercase tracking-tighter leading-none mb-6"
            style={{ textShadow: '0 0 12px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3)' }}
          >
            Start Working
          </h2>
          <p className="max-w-xl text-zinc-400 font-mono text-sm leading-relaxed mb-12">
            Everything you need to focus, track your progress, and stay accountable. Join the community and get started.
          </p>
          
          <Link href="/auth/signup">
            <button className="group relative border-4 border-white bg-white text-black font-black uppercase text-2xl md:text-4xl px-12 py-6 hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-4 rounded-md">
              <span>SIGN UP</span>
              <ArrowRight size={36} className="group-hover:translate-x-4 transition-transform duration-300" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
