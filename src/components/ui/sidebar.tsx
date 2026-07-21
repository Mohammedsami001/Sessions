import React from "react";
import Link from "next/link";
import { LayoutDashboard, User, Globe, Settings, Hexagon, CheckCircle, Crown, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onToggleMobile?: () => void;
}

export default function Sidebar({ 
  isCollapsed = false, 
  isMobileOpen = false, 
  onToggleCollapse, 
  onToggleMobile 
}: SidebarProps) {
  return (
    <aside className={`fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-900 flex flex-col p-6 z-50 overflow-y-auto hide-scrollbar transition-all duration-300 ${isCollapsed ? 'w-[72px] items-center px-2' : 'w-[250px]'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      
      {/* Brand / Logo */}
      <div className={`flex items-center gap-3 mb-8 shrink-0 ${isCollapsed ? 'justify-center pl-0' : 'pl-2 justify-between w-full'}`}>
        {!isCollapsed && (
          <span className="text-white font-bold tracking-tight text-sm">
            Sessions
          </span>
        )}
        
        {/* Toggle Button */}
        <button 
          data-testid="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle Sidebar (Cmd+\)"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 shrink-0 mb-8 w-full">
        <Link 
          href="/dashboard"
          className={`flex items-center gap-3 py-2.5 rounded-lg bg-white/5 text-white font-semibold text-sm transition-colors border border-white/10 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard size={18} className="text-white shrink-0" />
          {!isCollapsed && <span>Dashboard</span>}
        </Link>
        
        <Link 
          href="/profile"
          className={`flex items-center gap-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Profile" : undefined}
        >
          <User size={18} className="shrink-0" />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        
        <Link 
          href="/tasks"
          className={`flex items-center gap-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Global Tasks" : undefined}
        >
          <CheckCircle size={18} className="shrink-0" />
          {!isCollapsed && <span>Global Tasks</span>}
        </Link>

        <Link 
          href="/rooms"
          className={`flex items-center gap-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Browse Rooms" : undefined}
        >
          <Globe size={18} className="shrink-0" />
          {!isCollapsed && <span>Browse Rooms</span>}
        </Link>

        <Link 
          href="/settings"
          className={`flex items-center gap-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title={isCollapsed ? "Settings" : undefined}
        >
          <Settings size={18} className="shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </nav>

      {/* Widgets Area */}
      <div className="mt-auto flex flex-col gap-4 w-full">
        
        {/* Go Pro Widget */}
        <div className={`bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center shadow-sm ${isCollapsed ? 'p-2 justify-center' : 'p-4 gap-2 items-start'}`}>
          {isCollapsed ? (
            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors" title="Upgrade to Pro">
              <Crown size={18} />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={16} className="text-white" />
                <span className="text-sm font-bold text-white">Go Pro</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                Unlock ambient mixer, custom themes and more.
              </p>
              <button className="mt-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 w-full py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1">
                Upgrade Now <span className="text-lg leading-none">→</span>
              </button>
            </>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className={`mt-6 shrink-0 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'pl-1'}`}>
        {!isCollapsed && (
          <div className="text-[10px] text-zinc-600 font-medium">
            <p>© Sessions</p>            
          </div>
        )}
      </div>

    </aside>
  );
}
