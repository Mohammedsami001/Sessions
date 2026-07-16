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
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionActive(true);
        }
      } catch (err) {
      }
    }
    checkAuth();
  }, []);

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
