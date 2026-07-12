"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { chatService, profileService } from "../../lib/container";
import GlobalChatWidget from "../../components/ui/global-chat-widget";

import type { Profile, MessageWithProfile } from "../../lib/types";

export default function GlobalChatPage() {
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const m = await chatService.fetchRecentMessages(null, 100);
    setMessages(m);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const p = await profileService.ensureProfile(session.user.id, session.user.email || undefined, session.user.user_metadata);
        setProfile(p);
      }
      await loadMessages();
    }
    init();

    const sub = chatService.subscribeToMessages(null, () => loadMessages());
    return () => {
      sub.unsubscribe();
    };
  }, [loadMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !profile) return;
    const msg = await chatService.sendMessage(chatInput, profile.id, null);
    if (msg) {
      setChatInput("");
      await loadMessages();
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg-deep font-sans">
      <main className="flex-1 w-full px-4 md:px-8 py-8 relative overflow-hidden text-text-white max-w-5xl mx-auto z-20 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="text-text-gray hover:text-white flex items-center gap-2 transition-colors text-xs font-bold tracking-widest uppercase">
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
          <div className="bg-glass border border-border px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-gold">
            Global Network
          </div>
        </div>
        
        <div className="flex-1 flex flex-col bg-bg-card rounded-3xl border border-border overflow-hidden shadow-2xl p-6">
          <GlobalChatWidget 
            chatMessages={messages} 
            chatInput={chatInput} 
            setChatInput={setChatInput} 
            handleSendMessage={handleSendMessage} 
            chatEndRef={chatEndRef} 
          />
        </div>
      </main>

    </div>
  );
}
