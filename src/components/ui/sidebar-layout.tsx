"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Cmd+\ or Ctrl+\
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex relative overflow-hidden">
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden absolute top-4 left-4 z-40 p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-400 hover:text-white"
      >
        <Menu size={20} />
      </button>

      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
      />

      <div 
        className={`flex-1 relative w-full h-screen overflow-y-auto transition-all duration-300 ml-0 ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[250px]'}`}
      >
        {children}
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
