"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative w-full bg-[#08090D] border-t border-white/5 mt-auto z-20">
      {/* Glow highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-[#F0C040]/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand block */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2 text-white font-black tracking-widest text-lg font-sans">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
                <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM12.4306 9.70695C12.742 9.33317 13.2633 9.30058 13.6052 9.62118L19.1798 14.8165C19.4894 15.1054 19.4894 15.5841 19.1798 15.873L13.6052 21.0683C13.2633 21.3889 12.742 21.3563 12.4306 19.9991V9.70695Z" fill="currentColor" />
              </svg>
              <span>✦ SESSIONS ✦</span>
            </Link>
            
            <p className="text-xs md:text-sm text-gray-400 max-w-sm leading-relaxed font-sans">
              The synchronized deep-work OS. Engineered with server-authoritative Pomodoro timers, high-fidelity ambient mixes, and gamified progress protocols to accelerate focus.
            </p>
            
            <div className="flex items-center space-x-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors p-1 hover:scale-105 duration-200" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-500 transition-colors p-1 hover:scale-105 duration-200" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-widest text-yellow-500 uppercase font-bold">Lobby Protocol</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
              <li>
                <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Lobby Landing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Command Panel
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Student Profile
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: System Guidelines */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-widest text-yellow-500 uppercase font-bold">System Guidelines</h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-sans">
              <li>
                <a href="/#features" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Lobby Features
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Security Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Register Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: System Specs / Status */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-mono tracking-widest text-yellow-500 uppercase font-bold">Terminal Specs</h4>
            <div className="space-y-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1.5 font-mono text-[10px] text-gray-400">
                <div className="flex justify-between items-center">
                  <span>SYSTEM STATUS:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VERSION:</span>
                  <span className="text-white font-bold">v1.4.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>LATENCY:</span>
                  <span className="text-yellow-500">14ms</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-mono text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} SESSIONS PROTOCOL. ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>DESIGNED BY COGNITIVE INTERLINK</span>
            <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
