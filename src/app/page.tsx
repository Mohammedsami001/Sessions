"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Simple SVG pixel icons inspired by Streamline
const PixelTimerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 2H14V4H10V2ZM6 4H8V6H6V4ZM4 6H6V8H4V6ZM2 10H4V8H2V10ZM2 14H4V12H2V14ZM4 16H6V18H4V16ZM6 18H8V20H6V18ZM10 22H14V20H10V22ZM16 20H18V18H16V20ZM18 18H20V16H18V18ZM20 14H22V12H20V14ZM20 10H22V8H20V10ZM18 8H20V6H18V8ZM16 6H18V4H16V6ZM12 8H14V14H10V12H12V8Z" fill="#39FF14"/>
  </svg>
);

const PixelChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 4H20V6H22V16H20V18H16V20H14V22H10V20H12V18H4V16H2V6H4V4ZM20 16V6H4V16H14V18H16V16H20ZM8 10H10V12H8V10ZM14 10H16V12H14V10ZM10 14H14V16H10V14Z" fill="#39FF14"/>
  </svg>
);

const PixelMusicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M18 2H10V4H8V22H12V18H14V16H16V14H18V12H20V6H18V2ZM16 4H12V12H16V4ZM12 14H8V18H12V14ZM18 6H20V10H18V6ZM14 12H16V14H14V12Z" fill="#39FF14"/>
  </svg>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch with animations

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: 'var(--accent-green)', display: 'inline-block' }}></div>
          <span className="pixel-font" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>SESSIONS</span>
        </div>
        
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#community" className="nav-link">Community</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
          <Link href="/login" className="nav-link" style={{ color: 'white' }}>Log in</Link>
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '1rem' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '150px 20px 100px', textAlign: 'center' }}>
        
        <div className="animate-fade-in pixel-border" style={{ padding: '4px 12px', marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-green)', animation: 'pulse 2s infinite' }}></div>
          <span className="pixel-font" style={{ color: 'var(--accent-green)', fontSize: '1rem' }}>LAUNCHING SESSIONS V1</span>
        </div>

        <h1 className="animate-fade-in delay-1" style={{ fontSize: '5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', maxWidth: '800px' }}>
          The Ultimate <br/>
          <span className="pixel-font glow-text" style={{ color: 'var(--accent-green)', fontSize: '5.5rem' }}>STUDY OS</span>
        </h1>
        
        <p className="animate-fade-in delay-2" style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
          Synchronized Pomodoro timers, live study rooms, lofi beats, and gamified analytics. Built for students who want to focus together.
        </p>
        
        <div className="animate-fade-in delay-3" style={{ display: 'flex', gap: '20px' }}>
          <button className="btn-primary pixel-border">Start a Session</button>
          <button className="glass" style={{ color: 'white', padding: '10px 24px', fontFamily: 'Inter', fontSize: '1rem', cursor: 'pointer', border: '1px solid var(--border-color)', borderRadius: '4px', transition: 'all 0.2s' }}>
            Explore Lobby
          </button>
        </div>

        {/* Feature Grid mimicking Resend's Launch Week Showcase */}
        <div style={{ marginTop: '100px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%', maxWidth: '1000px' }}>
          {[
            { icon: <PixelTimerIcon />, title: 'Live Pomodoro Sync', desc: 'Perfectly synchronized timers for your entire study group.' },
            { icon: <PixelChatIcon />, title: 'Real-time Chat', desc: 'Connect, discuss, and hold each other accountable.' },
            { icon: <PixelMusicIcon />, title: 'Lofi & Ambient Mixer', desc: 'Built-in beats and ambient sounds to keep you in the zone.' },
          ].map((feature, i) => (
            <div key={i} className="glass pixel-border" style={{ padding: '30px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', transition: 'transform 0.3s' }} 
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ padding: '10px', background: 'rgba(57, 255, 20, 0.1)', display: 'inline-flex', width: 'fit-content' }}>
                {feature.icon}
              </div>
              <h3 className="pixel-font" style={{ fontSize: '1.5rem', color: 'white' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px', textAlign: 'center', marginTop: 'auto' }}>
        <p className="pixel-font" style={{ color: 'var(--text-secondary)' }}>© 2026 SESSIONS. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
