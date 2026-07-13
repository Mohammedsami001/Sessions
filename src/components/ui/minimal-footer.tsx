import React from "react";
import Link from "next/link";
import { Mail, Terminal } from "lucide-react";

export function MinimalFooter() {
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
      icon: <Mail size={16} className="text-zinc-500" />,
      text: "mohdsamisanadi@gmail.com",
      href: "mailto:mohdsamisanadi@gmail.com",
    },
    {
      icon: <Terminal size={16} className="text-zinc-500" />,
      text: "Version v1.5.0",
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
      href: "https://github.com/Mohammedsami001/Sessions",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      label: "Twitter",
      href: "https://x.com/SanadiMohdsami",
    },
  ];

  return (
    <footer className="w-full bg-[#050505] relative border-t border-white/5 overflow-hidden font-sans">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] opacity-20 pointer-events-none" style={{
        background: "radial-gradient(ellipse at top, rgba(225, 224, 204, 0.4) 0%, transparent 70%)"
      }}></div>

      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand section */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-[#E1E0CC] text-3xl font-bold tracking-tighter">
                SESSIONS
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium max-w-sm">
              The synchronized deep-work OS. Engineered with server-authoritative Pomodoro timers and gamified progress protocols to accelerate focus.
            </p>
          </div>

          {/* Footer link sections */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-10">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-zinc-400 hover:text-[#E1E0CC] transition-colors text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact & Status section */}
            <div>
              <h4 className="text-white text-sm font-bold mb-6 uppercase tracking-wider">
                Terminal Specs
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-sm text-zinc-400 font-medium">
                    {item.icon}
                    {item.href ? (
                      <a
                        href={item.href}
                        className="hover:text-[#E1E0CC] transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-6">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-500 hover:text-[#E1E0CC] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-600 uppercase">
            <span>&copy; {new Date().getFullYear()} SESSIONS. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
