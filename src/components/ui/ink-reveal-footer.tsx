"use client";

import React from "react";
import Link from "next/link";
import { Mail, Heart, Activity, Terminal } from "lucide-react";
import InkReveal from "./ink-reveal";

export function InkRevealFooter() {
  const footerLinks = [
    {
      title: "Study OS Protocol",
      links: [
        { label: "Sessions Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Student Profile", href: "/profile" },
      ],
    },
    {
      title: "System Guidelines",
      links: [
        { label: "Sessions Features", href: "/#features" },
        { label: "Security Sign In", href: "/login" },
        { label: "Register Profile", href: "/signup" },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Mail size={16} className="text-white" />,
      text: "hello@sessions.edu",
      href: "mailto:hello@sessions.edu",
    },
    {
      icon: <Terminal size={16} className="text-white" />,
      text: "Version v1.4.2",
    },
    {
      icon: <Activity size={16} className="text-emerald-400" />,
      text: "System: Online (14ms)",
      pulse: true,
    },
  ];

  const socialLinks = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      ),
      label: "GitHub",
      href: "https://github.com",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      label: "Twitter",
      href: "https://twitter.com",
    },
  ];

  return (
    <footer className="relative w-full h-[600px] overflow-hidden rounded-t-3xl bg-black">
      {/* 
        Revealed Layer (z-0):
        This layer has a vibrant background so it pops when the ink reveals it.
        We make it look premium and glassmorphic.
      */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between p-10 md:p-14 bg-gradient-to-br from-[#1a103c] via-[#4a1c40] to-[#120822]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12 z-0 relative">
          
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-[#F0C040] text-2xl font-extrabold animate-pulse">
                ✦
              </span>
              <span className="text-white text-3xl font-bold tracking-widest font-sans drop-shadow-md">
                SESSIONS
              </span>
            </Link>
            <p className="text-sm text-white/80 leading-relaxed font-sans max-w-xs font-medium">
              The synchronized deep-work OS. Engineered with server-authoritative Pomodoro timers and gamified progress protocols to accelerate focus.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="font-sans">
              <h4 className="text-white text-base font-bold mb-6 drop-shadow-md">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white hover:font-bold transition-all text-sm hover:translate-x-1 inline-block duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Status section */}
          <div className="font-sans">
            <h4 className="text-white text-base font-bold mb-6 drop-shadow-md">
              Terminal Specs
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm text-white/80 font-medium">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-white transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-white transition-colors flex items-center gap-1.5">
                      {item.text}
                      {item.pulse && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Huge Background Text for visual impact */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
          <span className="text-[12rem] font-black text-white whitespace-nowrap tracking-tighter">
            SESSIONS
          </span>
        </div>

        <hr className="border-t border-white/20 my-8 relative z-0" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 text-white/70 font-mono relative z-0">
          <div className="flex space-x-6">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-white transition-all hover:scale-110 duration-200 drop-shadow-md"
              >
                {icon}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1.5 font-bold">
            <span>&copy; {new Date().getFullYear()} SESSIONS PROTOCOL. ALL RIGHTS RESERVED.</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider">
            <span>DESIGNED BY COGNITIVE INTERLINK</span>
            <Heart size={10} className="text-red-500 fill-red-500 animate-pulse drop-shadow-md" />
          </div>
        </div>
      </div>

      {/* 
        Mask Layer (z-10): 
        The InkReveal component masks the colorful background with a solid black color.
        Since we set pointer-events: none inside InkReveal, clicks pass through to z-0!
      */}
      <InkReveal maskColor={[0, 0, 0]} className="z-10" />
    </footer>
  );
}
