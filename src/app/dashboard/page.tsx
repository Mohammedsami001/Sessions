"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { profileService, taskService, chatService, roomService } from "../../lib/container";
import type { Profile, Room, Task, MessageWithProfile, CreateRoomInput } from "../../lib/types";
import { computeLevelProgress, formatFocusHours, computeTimerRemaining } from "../../lib/types";
import { 
  LogOut, User, Sparkles, Activity, Plus, Play, Timer, Music, 
  MessageSquare, CheckSquare, Trash2, Users, Flame, Trophy, Clock, 
  Globe, Lock, ArrowLeft, Send, Check, Volume2, PlusCircle
} from "lucide-react";
import { GooeyLoader } from "../../components/ui/loader-10";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [chatError, setChatError] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRoomInput>({
    title: "", category: "General", visibility: "public",
    focus_duration: 1500, break_duration: 300, long_break_duration: 900, long_break_interval: 4,
  });

  const loadRooms = useCallback(async () => {
    const rs = await roomService.fetchPublicRooms();
    setRooms(rs);
    if (rs.length > 0) {
      const counts = await roomService.fetchParticipantCounts(rs.map(r => r.id));
      setParticipantCounts(counts);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    const m = await chatService.fetchRecentMessages(null, 30);
    setMessages(m);
  }, []);

  const loadTasks = useCallback(async () => {
    const t = await taskService.fetchTasks(null);
    setTasks(t);
  }, []);

  useEffect(() => {
    async function init() {
      // Auth guard — verify the user is ACTUALLY signed in via server check
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          window.location.href = '/login';
          return;
        }
      } catch {
        window.location.href = '/login';
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const p = await profileService.ensureProfile(user.id, user.email || undefined, user.user_metadata);
          setProfile(p);
        }
      } catch (err) {
        console.error('Dashboard profile load error:', err);
      }
      setLoading(false);

      // Load all data (these work independently of profile)
      try {
        await Promise.all([loadRooms(), loadMessages(), loadTasks()]);
      } catch (err) {
        console.error('Dashboard data load error:', err);
      }
    }

    init();

    // Set up Realtime subscriptions immediately
    const roomSub = roomService.subscribeToPublicRooms(() => loadRooms());
    const partSub = roomService.subscribeToPublicParticipants(() => loadRooms());
    const chatSub = chatService.subscribeToMessages(null, () => loadMessages());

    return () => {
      roomSub.unsubscribe();
      partSub.unsubscribe();
      chatSub.unsubscribe();
    };
  }, [loadRooms, loadMessages, loadTasks]);

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !profile) return;
    setChatError("");
    const msg = await chatService.sendMessage(chatInput, profile.id, null);
    if (msg) {
      setChatInput("");
      await loadMessages();
    } else {
      setChatError("Failed to send. Are you signed in?");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !profile) return;
    
    // Optimistic UI for tasks
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      id: tempId,
      text: newTodo.trim(),
      completed: false,
      user_id: profile.id,
      room_id: null,
      created_at: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, optimisticTask]);
    setNewTodo('');
    
    const savedTask = await taskService.createTask(optimisticTask.text, profile.id, null);
    if (savedTask) {
      setTasks(prev => prev.map(t => t.id === tempId ? savedTask : t));
    } else {
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    const success = await taskService.toggleTask(taskId, completed);
    if (!success) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const backup = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    const success = await taskService.deleteTask(taskId);
    if (!success) {
      setTasks(backup);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !createForm.title.trim()) return;
    setCreateError("");
    setLoadingCreate(true);
    const room = await roomService.createRoom(createForm, profile.id);
    if (room) {
      window.location.href = `/room/${room.id}`;
    } else {
      setCreateError("Failed to create room.");
      setLoadingCreate(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !profile) return;
    setJoinError("");
    setLoadingJoin(true);
    const { room, error } = await roomService.joinRoomByCode(joinCode, profile.id);
    if (room) {
      window.location.href = `/room/${room.id}`;
    } else {
      setJoinError(error || "Failed to join room.");
      setLoadingJoin(false);
    }
  };

  const handleQuickJoin = async (roomId: string) => {
    if (!profile) return;
    await roomService.joinRoom(roomId, profile.id);
    window.location.href = `/room/${roomId}`;
  };

  const levelInfo = profile ? computeLevelProgress(profile.exp) : { level: 0, currentExp: 0, nextLevelExp: 100, progress: 0 };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6">
        <GooeyLoader />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-deep px-4 md:px-8 py-8 relative overflow-hidden text-text-white font-sans max-w-7xl mx-auto z-20">
      
      {/* Upper Navigation Action Bar */}
      <div className="flex justify-between items-center mb-8 bg-glass/40 backdrop-blur-md border border-border px-6 py-3 rounded-full shadow-sm hover:border-border-hover transition-colors">
        <Link 
          href="/" 
          className="no-underline text-text-gray text-xs md:text-sm font-semibold tracking-wider hover:text-text-white flex items-center gap-2 group transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO HOME</span>
        </Link>
        <div className="flex gap-3 items-center">
          <Link 
            href="/profile" 
            className="no-underline text-gold hover:text-white text-xs font-bold tracking-wider border border-gold-border/30 hover:border-gold hover:bg-gold/10 px-4 py-2 rounded-full transition-all duration-300"
          >
            PROFILE
          </Link>
          <button 
            onClick={handleSignOut} 
            className="bg-transparent hover:bg-red/10 border border-border hover:border-red/40 text-text-gray hover:text-red px-4 py-2 rounded-full text-xs font-bold tracking-wider cursor-pointer transition-all duration-300 flex items-center gap-1.5"
          >
            <LogOut size={13} />
            SIGN OUT
          </button>
        </div>
      </div>

      {/* Hero Welcome Command Panel */}
      <header className="relative mb-8 bg-gradient-to-r from-bg-card to-bg-card/90 backdrop-blur-3xl border border-border/80 p-6 md:p-8 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-md hover:border-border-hover transition-all duration-500">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center gap-5 w-full lg:w-auto">
          {/* Avatar with beautiful warm gold gradient & blinking online status */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange to-gold flex items-center justify-center font-extrabold text-2xl text-bg-deep shadow-[0_0_25px_rgba(240,192,64,0.3)] transform hover:scale-105 transition-transform duration-300 select-none">
              {profile?.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green rounded-full border-2 border-bg-deep shadow-[0_0_8px_#22C55E]"></span>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text-white leading-tight flex flex-wrap items-center gap-2">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-orange font-semibold">{profile?.display_name || 'Student'}</span>
            </h1>
            <p className="text-xs md:text-sm text-text-gray flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
              </span>
              Multiplayer Network Status: <span className="text-green font-bold">ACTIVE PROTOCOL</span>
            </p>
          </div>
        </div>

        {/* Level & focus metrics dashboard overlay */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 border-border/40 pt-4 lg:pt-0">
          <div className="flex flex-col items-center px-4 py-2 bg-glass rounded-xl border border-border/50 text-center shrink-0 min-w-[100px] hover:border-gold-border/20 transition-colors">
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">LEVEL</span>
            <span className="text-lg font-black text-gold tracking-wide mt-0.5">✦ {levelInfo.level} ✦</span>
          </div>
          
          <div className="flex flex-col items-center px-4 py-2 bg-glass rounded-xl border border-border/50 text-center shrink-0 min-w-[120px] hover:border-gold-border/20 transition-colors">
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">TOTAL FOCUS</span>
            <span className="text-lg font-black text-text-white mt-0.5">{formatFocusHours(profile?.total_focus_seconds || 0)}</span>
          </div>

          <div className="flex flex-col items-center px-4 py-2 bg-glass rounded-xl border border-border/50 text-center shrink-0 min-w-[100px] hover:border-gold-border/20 transition-colors">
            <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">EXPERIENCE</span>
            <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-orange mt-0.5">{profile?.exp || 0} XP</span>
          </div>
        </div>
      </header>

      {/* Code Entry / Join Area */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center bg-bg-surface/50 border border-border/60 p-4 rounded-xl shadow-inner max-w-2xl hover:border-border transition-colors">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="ENTER ROOM JOIN CODE..." 
            value={joinCode} 
            onChange={e => setJoinCode(e.target.value.toUpperCase())} 
            className="w-full bg-black/40 border border-border/60 focus:border-gold/60 focus:ring-1 focus:ring-gold/30 px-4 py-3 rounded-lg text-text-white font-bold text-sm tracking-widest placeholder:text-text-muted uppercase outline-none transition-all duration-300"
          />
        </div>
        <button 
          onClick={handleJoinByCode} 
          className="bg-glass hover:bg-gold hover:text-bg-deep border border-border hover:border-gold text-text-white px-6 py-3 rounded-lg text-xs font-black tracking-widest uppercase cursor-pointer transition-all duration-300 shrink-0"
        >
          JOIN SESSION
        </button>
        {joinError && (
          <span className="text-xs text-red font-semibold bg-red-dim border border-red/20 px-3 py-2 rounded-lg animate-shake sm:max-w-xs text-center shrink-0">
            {joinError}
          </span>
        )}
      </div>

      {/* Bento Layout Grid */}
      <section className="bento-grid gap-6">
        
        {/* Active Shared Rooms Panel */}
        <div className="bento-card bento-rooms flex flex-col min-h-[460px] bg-gradient-to-b from-bg-card to-bg-card/85 relative group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold/50 via-orange/50 to-transparent"></div>
          
          <div className="bento-header flex justify-between items-center mb-6">
            <div>
              <h2 className="bento-title text-lg font-extrabold flex items-center gap-2">
                <Globe size={18} className="text-gold animate-pulse" />
                Active Multiplayer Rooms
              </h2>
              <p className="text-xs text-text-gray mt-0.5">{rooms.length} synchronized study sessions online</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="bg-gradient-to-r from-gold to-orange hover:from-white hover:to-white text-bg-deep px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-1"
            >
              <PlusCircle size={14} />
              Host Room
            </button>
          </div>

          {/* Room entries */}
          <div className="room-list flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-glass">
            {rooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-48 py-10 opacity-70">
                <div className="w-12 h-12 rounded-full bg-glass flex items-center justify-center text-text-muted text-lg mb-3">📡</div>
                <p className="text-text-gray text-sm font-semibold max-w-sm">No synchronized rooms active. Be the pioneer and launch a deep-focus room!</p>
              </div>
            ) : (
              rooms.map(room => {
                const timer = computeTimerRemaining(room.timer_started_at, room.timer_status, room.focus_duration, room.break_duration, room.long_break_duration);
                return (
                  <div 
                    key={room.id} 
                    className="room-item bg-glass/60 hover:bg-glass border border-border/80 hover:border-border-hover/80 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 shadow-sm"
                  >
                    <div className="room-item-info flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] bg-gold-dim border border-gold-border/30 text-gold font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
                          {room.category}
                        </span>
                        {room.visibility === 'private' && (
                          <span className="text-[9px] bg-red-dim border border-red/20 text-red font-bold px-2 py-0.5 rounded-full tracking-widest uppercase flex items-center gap-0.5">
                            <Lock size={8} /> PRIVATE
                          </span>
                        )}
                      </div>
                      
                      <div className="room-item-title text-base font-bold text-text-white tracking-wide">
                        {room.title}
                      </div>
                      
                      <div className="room-item-meta flex items-center gap-3 text-xs text-text-gray mt-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className="online-dot shrink-0"></span>
                          <span className="font-semibold text-text-white">{participantCounts[room.id] || 0}</span> peers study
                        </span>
                        <span className="text-text-muted">•</span>
                        <span 
                          className="font-bold flex items-center gap-1"
                          style={{ color: room.timer_status === 'focus' ? 'var(--orange)' : room.timer_status === 'idle' ? 'var(--text-gray)' : '#3B82F6' }}
                        >
                          <Clock size={12} />
                          {room.timer_status === 'idle' ? 'STANDBY' : `${String(timer.minutes).padStart(2,'0')}:${String(timer.seconds).padStart(2,'0')} [${room.timer_status.toUpperCase().replace('_',' ')}]`}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleQuickJoin(room.id)} 
                      className="w-full md:w-auto bg-glass/60 hover:bg-gold hover:text-bg-deep text-text-gray px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase cursor-pointer border border-border/80 hover:border-gold shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      ENTER ROOM
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-[11px] text-text-gray font-medium">Want to sync a customized Pomodoro interval timers with peers?</span>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="text-xs text-gold hover:text-white font-bold tracking-wider flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 group"
            >
              <span>Host custom room</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Minimalist Premium Pomodoro Preview Circle */}
        <div className="bento-card bento-pomodoro flex flex-col justify-center items-center text-center bg-gradient-to-b from-bg-card to-bg-card/85 relative overflow-hidden group min-h-[460px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange/50 via-gold/50 to-transparent"></div>
          
          <div className="w-full flex flex-col items-center z-10">
            <p className="text-[10px] text-text-gray font-bold tracking-widest uppercase flex items-center gap-1.5 mb-6">
              <Timer size={13} className="text-orange" />
              Engine Core Standby
            </p>
            
            {/* Visualizer Circle */}
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center p-1 bg-gradient-to-tr from-orange via-gold/10 to-orange/20 shadow-[0_0_50px_rgba(255,107,44,0.1)] mb-6">
              <div className="absolute inset-0.5 rounded-full bg-bg-deep/95 backdrop-blur-lg flex flex-col items-center justify-center z-10 border border-border">
                <div className="text-4xl font-black text-text-white tracking-tighter leading-none select-none font-sans">
                  25:00
                </div>
                <div className="text-[9px] font-bold tracking-widest text-orange mt-2 uppercase select-none">
                  READY STATE
                </div>
              </div>
            </div>

            <p className="text-xs text-text-gray max-w-[200px] leading-relaxed mb-6">
              Synchronized timer, focus cycle database, and intervals are handled live inside rooms.
            </p>
            
            <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-border/40 text-center">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase flex items-center justify-center gap-0.5">
                  <Trophy size={10} className="text-gold" />
                  sessions
                </span>
                <span className="text-base font-black text-text-white mt-0.5">{profile?.total_sessions || 0}</span>
              </div>
              <div className="flex flex-col border-l border-border/40">
                <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase flex items-center justify-center gap-0.5">
                  <Flame size={10} className="text-orange animate-bounce" />
                  focus streak
                </span>
                <span className="text-base font-black text-orange mt-0.5">{profile?.streak_days || 0} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Sound Mixer Panel */}
        <div className="bento-card bento-lofi flex flex-col bg-gradient-to-b from-bg-card to-bg-card/85 relative group overflow-hidden min-h-[340px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange/30 to-transparent"></div>
          
          <div className="bento-header flex justify-between items-center mb-6">
            <h2 className="bento-title text-base font-extrabold flex items-center gap-2">
              <Music size={16} className="text-orange" />
              Ambient sound deck
            </h2>
            <span className="text-[9px] bg-gradient-to-r from-gold/20 to-orange/20 border border-gold-border/40 text-gold font-bold px-2 py-0.5 rounded-full tracking-widest uppercase">
              PRO MODULE
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center p-4 relative">
            {/* Absolute overlay locking the teaser */}
            <div className="absolute inset-0 bg-bg-card/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-bg-deep border border-gold-border/20 flex items-center justify-center text-gold shadow-md mb-3 transform group-hover:scale-110 transition-transform duration-300">
                <Lock size={18} />
              </div>
              <p className="text-sm font-bold text-text-white tracking-wide">Ambient Audio Mixer</p>
              <p className="text-xs text-text-gray max-w-[200px] mt-1">
                Customize rain, fireplace, cafe, and lofi streams under <span className="text-gold font-semibold">Sessions Pro</span>.
              </p>
            </div>

            {/* Blurred placeholder controls under lock */}
            <div className="w-full space-y-4 opacity-15 filter blur-[1.5px] select-none pointer-events-none">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-text-gray w-16 text-left">Lofi Radio</span>
                <input type="range" disabled className="flex-1 h-1 bg-glass rounded-lg accent-gold" />
                <Volume2 size={14} className="text-text-muted" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-text-gray w-16 text-left">Rain Storm</span>
                <input type="range" disabled className="flex-1 h-1 bg-glass rounded-lg accent-gold" />
                <Volume2 size={14} className="text-text-muted" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-text-gray w-16 text-left">Fireplace</span>
                <input type="range" disabled className="flex-1 h-1 bg-glass rounded-lg accent-gold" />
                <Volume2 size={14} className="text-text-muted" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Stream Chat Panel */}
        <div className="bento-card bento-chat flex flex-col bg-gradient-to-b from-bg-card to-bg-card/85 relative min-h-[340px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold/30 to-transparent"></div>
          
          <div className="bento-header mb-4">
            <h2 className="bento-title text-base font-extrabold flex items-center gap-2">
              <MessageSquare size={16} className="text-gold" />
              Global Chat Stream
            </h2>
          </div>

          {/* Messages block */}
          <div className="chat-stream flex-1 overflow-y-auto space-y-2.5 pr-1 mb-4 max-h-[170px] scrollbar-thin scrollbar-thumb-glass">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full opacity-60">
                <p className="text-text-gray text-xs font-medium">Stream is quiet. Broadcast a transmission!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="chat-message bg-glass/40 border border-border/40 p-2.5 rounded-lg flex flex-col gap-0.5 hover:border-border-hover/50 transition-colors">
                  <span className="chat-user text-[11px] font-bold text-gold tracking-wide uppercase">
                    {msg.profiles?.display_name || 'Anon'}
                  </span>
                  <span className="text-xs text-text-white/90 break-words font-medium">
                    {msg.content}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Interactive input */}
          <div className="flex flex-col gap-1.5 mt-auto border-t border-border/40 pt-3">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="TRANSMIT MESSAGE..." 
                value={chatInput} 
                onChange={e => setChatInput(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }} 
                className="flex-1 bg-black/40 border border-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 px-3 py-2 rounded-lg text-xs text-text-white placeholder:text-text-muted outline-none transition-all"
              />
              <button 
                onClick={handleSendMessage} 
                className="bg-gold hover:bg-white text-bg-deep px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center shrink-0"
                title="Send Transmission"
              >
                <Send size={13} />
              </button>
            </div>
            {chatError && <div className="text-[10px] text-red font-medium leading-none mt-1">{chatError}</div>}
          </div>
        </div>

        {/* User Tasks Checklist Card */}
        <div className="bento-card bento-todos flex flex-col bg-gradient-to-b from-bg-card to-bg-card/85 relative min-h-[340px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange/30 to-transparent"></div>
          
          <div className="bento-header mb-4">
            <h2 className="bento-title text-base font-extrabold flex items-center gap-2">
              <CheckSquare size={16} className="text-orange" />
              Study Checklist
            </h2>
          </div>

          {/* Form add task */}
          <form onSubmit={handleAddTask} className="flex gap-1.5 mb-4">
            <input 
              type="text" 
              placeholder="NEW TASK..." 
              value={newTodo} 
              onChange={e => setNewTodo(e.target.value)} 
              className="flex-1 bg-black/40 border border-border focus:border-orange/60 focus:ring-1 focus:ring-orange/30 px-3 py-2 rounded-lg text-xs text-text-white placeholder:text-text-muted outline-none transition-all"
            />
            <button 
              type="submit" 
              className="bg-glass hover:bg-orange hover:text-white border border-border hover:border-orange px-3 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0"
            >
              +
            </button>
          </form>

          {/* Tasks list */}
          <div className="todo-list flex-1 overflow-y-auto space-y-2.5 max-h-[160px] scrollbar-thin scrollbar-thumb-glass pr-1">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-24 opacity-60">
                <p className="text-text-gray text-xs font-medium">All tasks cleared. Good job!</p>
              </div>
            ) : (
              tasks.map(todo => (
                <div 
                  key={todo.id} 
                  className={`todo-item bg-glass/20 border border-border/30 hover:border-border-hover/50 p-2.5 rounded-lg flex items-center justify-between gap-3 group transition-all duration-200 ${todo.completed ? 'opacity-40 line-through bg-black/10' : ''}`}
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      onChange={() => handleToggleTask(todo.id, !todo.completed)}
                      className="accent-orange rounded cursor-pointer w-4 h-4 shrink-0"
                    />
                    <span className="text-xs text-text-white font-medium truncate leading-tight select-none">
                      {todo.text}
                    </span>
                  </label>
                  
                  <button 
                    onClick={(e) => { e.preventDefault(); handleDeleteTask(todo.id); }} 
                    className="bg-transparent border-0 text-text-muted hover:text-red cursor-pointer p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 shrink-0"
                    title="Delete Task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-border/40 text-center text-[10px] text-text-muted font-semibold tracking-wider">
            TASKS PERSIST SECURELY ON CLOUD
          </div>
        </div>

      </section>

      {/* Host New Room Overlay Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-bg-surface border border-gold-border/30 rounded-2xl shadow-2xl p-6 md:p-8 relative overflow-hidden animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal top shine */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-gold via-orange to-gold"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight text-text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-gold animate-spin-slow" />
                  Launch Shared Study Console
                </h3>
                <p className="text-xs text-text-gray mt-1">Configure and synchronize a real-time intervals grid</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="bg-glass hover:bg-glass-hover border border-border hover:border-border-hover text-text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Form title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Room Title</label>
                <input 
                  type="text" 
                  value={createForm.title} 
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })} 
                  placeholder="e.g. Deep Work: LeetCode Grind" 
                  className="bg-black/40 border border-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 px-4 py-3 rounded-lg text-sm text-text-white outline-none placeholder:text-text-muted transition-all"
                />
              </div>

              {/* Grid selectors Category and visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Subject / Category</label>
                  <select 
                    value={createForm.category} 
                    onChange={e => setCreateForm({ ...createForm, category: e.target.value })} 
                    className="bg-black/40 border border-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 px-3 py-3 rounded-lg text-sm text-text-white outline-none cursor-pointer transition-all select-none"
                  >
                    {["General", "Computer Science", "Medicine", "Engineering", "Law", "Chemistry", "Physics", "Mathematics", "Languages", "Business", "Art & Design"].map(c => (
                      <option key={c} value={c} className="bg-bg-surface text-text-white">{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Visibility</label>
                  <div className="flex gap-2">
                    {(['public', 'private'] as const).map(v => (
                      <button 
                        key={v} 
                        type="button" 
                        onClick={() => setCreateForm({ ...createForm, visibility: v })} 
                        className={`flex-1 py-3 px-2 rounded-lg cursor-pointer font-bold text-[11px] tracking-widest uppercase border transition-all ${createForm.visibility === v ? (v === 'public' ? 'bg-green/10 border-green text-green' : 'bg-orange/10 border-orange text-orange') : 'bg-black/20 border-border text-text-gray hover:border-border-hover'}`}
                      >
                        {v === 'public' ? '🌐 Public' : '🔒 Private'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intervals selection */}
              <div className="border-t border-border/40 pt-4 mt-2">
                <h4 className="text-[10px] text-text-muted font-bold tracking-wider uppercase mb-3">Sync Durations (Minutes)</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-medium uppercase">Focus</span>
                    <select 
                      value={(createForm.focus_duration || 1500) / 60} 
                      onChange={e => setCreateForm({ ...createForm, focus_duration: Number(e.target.value) * 60 })} 
                      className="bg-black/40 border border-border px-2 py-2 rounded-md text-xs text-text-white cursor-pointer"
                    >
                      {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m} className="bg-bg-surface">{m}m</option>)}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-medium uppercase">Short Break</span>
                    <select 
                      value={(createForm.break_duration || 300) / 60} 
                      onChange={e => setCreateForm({ ...createForm, break_duration: Number(e.target.value) * 60 })} 
                      className="bg-black/40 border border-border px-2 py-2 rounded-md text-xs text-text-white cursor-pointer"
                    >
                      {[3, 5, 10, 15].map(m => <option key={m} value={m} className="bg-bg-surface">{m}m</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-medium uppercase">Long Break</span>
                    <select 
                      value={(createForm.long_break_duration || 900) / 60} 
                      onChange={e => setCreateForm({ ...createForm, long_break_duration: Number(e.target.value) * 60 })} 
                      className="bg-black/40 border border-border px-2 py-2 rounded-md text-xs text-text-white cursor-pointer"
                    >
                      {[10, 15, 20, 30].map(m => <option key={m} value={m} className="bg-bg-surface">{m}m</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-text-muted font-medium uppercase">Interval</span>
                    <select 
                      value={createForm.long_break_interval || 4} 
                      onChange={e => setCreateForm({ ...createForm, long_break_interval: Number(e.target.value) })} 
                      className="bg-black/40 border border-border px-2 py-2 rounded-md text-xs text-text-white cursor-pointer"
                    >
                      {[2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="bg-bg-surface">{n} cyc</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <button 
                onClick={handleCreateRoom} 
                className="w-full bg-gradient-to-r from-gold to-orange hover:from-white hover:to-white text-bg-deep font-extrabold text-sm tracking-widest uppercase py-4 rounded-xl cursor-pointer mt-6 shadow-md transition-all active:scale-[0.98]"
              >
                CREATE & ENTER ROOM
              </button>
              
              {createError && (
                <div className="bg-red-dim border border-red/30 text-red px-4 py-3 rounded-lg text-xs font-semibold text-center mt-3 animate-shake">
                  {createError}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      
    </main>
  );
}
