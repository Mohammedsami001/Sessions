"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '18px', color: 'white' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          SESSIONS
        </Link>
        
        <div className="nav-links">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#community" className="nav-link">Community</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/login" className="nav-link">Log in</Link>
          <button className="btn-glass">Get started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '40px' }}>
        
        {/* Top Stamps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '10px 15px', borderRadius: '4px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '24px', fontWeight: 800 }}>S</span>
            <span style={{ fontSize: '10px', color: 'var(--text-gray)' }}>SESSION</span>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', fontSize: '10px', letterSpacing: '1px' }}>FEATURES BY SESSIONS</div>
            <div style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', fontSize: '10px', letterSpacing: '1px' }}>NO. 7777</div>
          </div>
        </div>

        <div className="title-container">
          <div className="production-stamp">NEXT-GENERATION STUDY OS</div>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0 20px 0', width: '100%' }}>
            <img 
              src="/sessions_hero.png" 
              alt="SESSIONS" 
              style={{ 
                width: '100%', 
                maxWidth: '900px', 
                height: 'auto'
              }} 
            />
          </div>
          
          <div className="hero-gold-subtitle">
            The Premium Workspace for Deep Work & Synchronized Focus
          </div>
        </div>
      </main>

      {/* Floating Ticket Dock */}
      <div className="dock-container">
        <div className="ticket ticket-dark"><span>Live Rooms</span></div>
        <div className="ticket ticket-green"><span>Pomodoro</span></div>
        <div className="ticket ticket-blue"><span>Global Chat</span></div>
        <div className="ticket ticket-purple"><span>Lofi Mixer</span></div>
        <div className="ticket ticket-pink"><span>To-Dos</span></div>
        <div className="ticket ticket-orange"><span>Analytics</span></div>
      </div>
    </>
  );
}
