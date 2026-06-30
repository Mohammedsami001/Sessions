"use client";
import React from "react";
import Link from "next/link";
import {
  Mail,
  Heart,
  Activity,
  Terminal,
} from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/hover-footer";

export function Footer() {
  // Footer link data adapted for Sessions
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

  // Contact info / System status data
  const contactInfo = [
    {
      icon: <Mail size={16} className="text-[#3ca2fa]" />,
      text: "hello@sessions.edu",
      href: "mailto:hello@sessions.edu",
    },
    {
      icon: <Terminal size={16} className="text-[#3ca2fa]" />,
      text: "Version v1.4.2",
    },
    {
      icon: <Activity size={16} className="text-emerald-400" />,
      text: "System: Online (14ms)",
      pulse: true,
    },
  ];

  // Social media icons
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
    <footer className="bg-[#0F0F11]/60 border-t border-white/5 relative h-fit rounded-3xl overflow-hidden m-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto p-10 md:p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-[#F0C040] text-2xl font-extrabold animate-pulse">
                ✦
              </span>
              <span className="text-white text-2xl font-bold tracking-widest font-sans">
                SESSIONS
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed font-sans max-w-xs">
              The synchronized deep-work OS. Engineered with server-authoritative Pomodoro timers, high-fidelity ambient mixes, and gamified progress protocols to accelerate focus.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="font-sans">
              <h4 className="text-white text-base font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-[#3ca2fa] transition-colors text-sm hover:translate-x-1 inline-block duration-200"
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
            <h4 className="text-white text-base font-semibold mb-6">
              Terminal Specs
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm text-gray-400">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="hover:text-[#3ca2fa] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="hover:text-white transition-colors flex items-center gap-1.5">
                      {item.text}
                      {item.pulse && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-white/5 my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0 text-gray-500 font-mono">
          {/* Social icons */}
          <div className="flex space-x-6">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="hover:text-[#3ca2fa] transition-colors hover:scale-105 duration-200"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} SESSIONS PROTOCOL. ALL RIGHTS RESERVED.</span>
          </div>

          {/* Subtext */}
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>DESIGNED BY COGNITIVE INTERLINK</span>
            <Heart size={10} className="text-red-500 fill-red-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Text hover effect */}
      <div className="lg:flex hidden h-[30rem] -mt-52 -mb-36">
        <TextHoverEffect text="SESSIONS" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
