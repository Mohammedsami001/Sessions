"use client";

import { useEffect, useState } from "react";
import { SessionsHero } from "@/components/ui/sessions-hero";
import { ParallaxEngineCore } from "@/components/ui/parallax-engine-core";
import { ParallaxNetwork } from "@/components/ui/parallax-network";
import { ParallaxData } from "@/components/ui/parallax-data";
import { ParallaxIdentity } from "@/components/ui/parallax-identity";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { ParallaxTrack } from "@/components/ui/parallax-track";
import { supabase } from "@/lib/supabase";

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
          // Auto-redirect to dashboard if already logged in? Or let them click the button.
        }
      } catch (err) {
        // Fallback silently if unconfigured
      }
    }
    checkAuth();
  }, []);

  if (!mounted) {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center">
        <div className="text-[#E1E0CC] font-sans tracking-widest text-xs animate-pulse">
          INITIALIZING...
        </div>
      </div>
    );
  }

  // We can pass sessionActive to SessionsHero if we want to change the button text,
  // but for now let's just render the component as requested.
  return (
    <main className="min-h-screen bg-black">
      <SessionsHero sessionActive={sessionActive} />
      <div id="features">
        <ParallaxTrack>
          <ParallaxEngineCore />
          <ParallaxNetwork />
          <ParallaxData />
          <ParallaxIdentity />
          <MinimalFooter />
        </ParallaxTrack>
      </div>
    </main>
  );
}
