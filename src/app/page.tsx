"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { HeroSection } from "@/components/ui/3d-hero-section-boxes";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionActive(true);
        }
      } catch (err) {
        // Fallback silently if unconfigured
      }
    }
    checkAuth();
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[#08090D] h-screen w-screen flex items-center justify-center">
        <div className="text-yellow-500 font-mono tracking-widest text-xs animate-pulse">
          INITIALIZING LOBBY OS...
        </div>
      </div>
    );
  }

  return <HeroSection sessionActive={sessionActive} />;
}
