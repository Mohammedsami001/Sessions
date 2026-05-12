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
      <div className="gradient-bg"></div>
      
      {/* Resend Clone Navbar */}
      <nav className="navbar flex items-center">
        <div className="container flex items-center justify-between" style={{ width: '100%' }}>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sessions
            </Link>
            <div className="flex items-center gap-6" style={{ fontSize: '14px', color: 'var(--gray-400)', marginLeft: '16px' }}>
              <Link href="#features">Features</Link>
              <Link href="#community">Community</Link>
              <Link href="#pricing">Pricing</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6" style={{ fontSize: '14px' }}>
            <Link href="/login" style={{ color: 'var(--gray-300)' }}>Log in</Link>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '14px' }}>Get started</button>
          </div>
        </div>
      </nav>

      {/* Resend Clone Hero Section */}
      <main className="container" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
        <div className="flex flex-col items-center justify-center">
          
          <div className="badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sessions V1 • May, 2026
          </div>
          
          <h1 className="hero-title">
            The Ultimate <br /> Study OS
          </h1>
          
          <p className="hero-subtitle">
            Synchronized Pomodoro timers, live study rooms, lofi beats, and gamified analytics. Built for students who want to focus together.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button className="btn-primary">Start a Session</button>
            <button className="btn-secondary">Explore Lobby</button>
          </div>
        </div>

        {/* Resend Clone Bento Grid */}
        <div className="bento-grid">
          
          {/* Card 1 */}
          <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="bento-title">Live Pomodoro Sync</h3>
            <p className="bento-desc">Perfectly synchronized timers for your entire study group. When the host hits start, everyone focuses together.</p>
          </div>

          {/* Card 2 */}
          <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="bento-title">Real-time Chat</h3>
            <p className="bento-desc">Connect with other students in your room. Discuss coding problems, share tips, and hold each other accountable.</p>
          </div>

          {/* Card 3 */}
          <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <h3 className="bento-title">Lofi & Ambient Mixer</h3>
            <p className="bento-desc">Mix Rain, Fireplace, and Café sounds with a curated Lofi radio, directly inside the app. No extra tabs needed.</p>
          </div>

           {/* Card 4 */}
           <div className="bento-card">
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h3 className="bento-title">Session To-Dos</h3>
            <p className="bento-desc">Ephemeral checklists for your 25-minute focus blocks. Stay on track and smash your micro-goals.</p>
          </div>

          {/* Card 5 */}
          <div className="bento-card" style={{ gridColumn: 'span 2' }}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
            </div>
            <h3 className="bento-title">Gamified Analytics</h3>
            <p className="bento-desc">Level up your study habits. Track lifetime hours, total sessions completed, and unlock custom profile themes with a GitHub-style productivity heatmap.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', marginTop: 'auto' }}>
        <div className="container flex justify-between items-center" style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
          <span>© 2026 Sessions Inc.</span>
          <div className="flex gap-4">
            <Link href="#">Twitter</Link>
            <Link href="#">GitHub</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
