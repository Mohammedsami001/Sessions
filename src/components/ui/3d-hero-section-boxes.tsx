"use client";

import React, { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';

function HeroSplineBackground() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      pointerEvents: 'auto',
      overflow: 'hidden',
    }}>
      <Spline
        style={{
          width: '100%',
          height: '100vh',
          pointerEvents: 'auto',
        }}
        scene="https://prod.spline.design/dJqTIQ-tE3ULUPMi/scene.splinecode"
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.8), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.8)),
            linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.9))
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}


import Link from 'next/link';

function HeroContent({ sessionActive }: { sessionActive: boolean }) {
  return (
    <div className="text-white px-4 max-w-screen-xl mx-auto w-full flex flex-col lg:flex-row justify-between items-start lg:items-center py-16">

      <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mb-8 lg:mb-0">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight tracking-wide font-sans">
          We're Building<br />Cool Experiences
        </h1>
        <div className="text-xs sm:text-sm text-gray-400 font-mono tracking-widest mt-4">
          AI \ MULTIPLAYER \ DESIGN \ MOTION \ 3D
        </div>
      </div>

      <div className="w-full lg:w-1/2 pl-0 lg:pl-8 flex flex-col items-start">
         <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-md">
           Synchronized Pomodoro study rooms, lofi audio mixing, and gamified level tracking. Step into the ultimate deep-work environment.
        </p>
        <div className="flex pointer-events-auto flex-col sm:flex-row items-stretch sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 w-full">
          {sessionActive ? (
            <>
              <Link href="/dashboard" className="border border-white/30 text-white font-semibold py-3 px-8 rounded-2xl transition duration-300 text-center hover:bg-white hover:text-black hover:border-white">
                Launch Dashboard
              </Link>
              <Link href="/dashboard" className="bg-white text-black font-semibold py-3 px-8 rounded-2xl transition duration-300 hover:scale-105 flex items-center justify-center text-center">
                 <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor" />
                 </svg>
                 Explore Study Rooms
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="border border-white/30 text-white font-semibold py-3 px-8 rounded-2xl transition duration-300 text-center hover:bg-white hover:text-black hover:border-white">
                Sign In
              </Link>
              <Link href="/signup" className="bg-white text-black font-semibold py-3 px-8 rounded-2xl transition duration-300 hover:scale-105 flex items-center justify-center text-center">
                 <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5C13 4.44772 12.5523 4 12 4Z" fill="currentColor" />
                 </svg>
                 Get Started Free
              </Link>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

function Navbar({ sessionActive }: { sessionActive: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 border-b border-white/5" style={{ backgroundColor: 'rgba(8, 9, 13, 0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-white font-black tracking-widest text-lg font-sans">
             <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
              <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM12.4306 9.70695C12.742 9.33317 13.2633 9.30058 13.6052 9.62118L19.1798 14.8165C19.4894 15.1054 19.4894 15.5841 19.1798 15.873L13.6052 21.0683C13.2633 21.3889 12.742 21.3563 12.4306 19.9991V9.70695Z" fill="currentColor" />
            </svg>
            <span>SESSIONS</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition duration-150">Features</a>
            <a href="#about" className="text-gray-400 hover:text-white text-sm transition duration-150">About</a>
            <a href="#community" className="text-gray-400 hover:text-white text-sm transition duration-150">Community</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {sessionActive ? (
            <Link href="/dashboard" className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition duration-300">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-gray-300 hover:text-white text-sm transition duration-150">Sign In</Link>
              <Link href="/signup" className="border border-white/20 text-white px-5 py-1.5 rounded-full text-xs sm:text-sm hover:bg-white hover:text-black hover:border-white transition duration-300">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const HeroSection = ({ sessionActive = false }: { sessionActive?: boolean }) => {
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY || window.pageYOffset;

          const maxScroll = 400;
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
          if (heroContentRef.current) {
             heroContentRef.current.style.opacity = opacity.toString();
          }
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-[#08090D] overflow-x-hidden min-h-screen text-white">
      <Navbar sessionActive={sessionActive} />

      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <HeroSplineBackground />
        </div>

        <div ref={heroContentRef} className="relative z-10 w-full pt-16" style={{ pointerEvents: 'none' }}>
          <HeroContent sessionActive={sessionActive} />
        </div>
      </div>

      <div className="bg-[#08090D] relative z-10 pb-24 border-t border-white/5">

        <div id="features" className="container mx-auto px-4 md:px-6 lg:px-8 mt-12 text-center max-w-4xl">
          <span className="text-yellow-500 font-mono text-xs uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/25">Lobby OS Features</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-6 mb-4 font-sans tracking-tight">Everything You Need for Deep Work</h2>
          <p className="text-gray-400 text-base sm:text-lg mb-16 max-w-xl mx-auto">Sessions is a synchronized multi-student space engineered to eliminate distractions and induce absolute focus.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-white/10 hover:bg-white/[0.03] transition duration-300">
              <span className="text-3xl block mb-4">⏱️</span>
              <h3 className="text-xl font-bold mb-2">Synchronized Focus</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Server-authoritative Pomodoro timers keep all participants inside a room aligned on focusing and break intervals.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-white/10 hover:bg-white/[0.03] transition duration-300">
              <span className="text-3xl block mb-4">🎵</span>
              <h3 className="text-xl font-bold mb-2">Ambient Lofi Sound</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Tease the perfect concentration atmosphere by mixing Lofi radio streams with ambient rain, café chat, and cozy fire crackles.</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:border-white/10 hover:bg-white/[0.03] transition duration-300">
              <span className="text-3xl block mb-4">📈</span>
              <h3 className="text-xl font-bold mb-2">Level Protocols</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Accumulate EXP from focus milestones. Upgrade your student tier badges and unlock detailed gamified analytics.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { HeroSection }

