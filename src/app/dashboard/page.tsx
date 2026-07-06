"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
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
import UserStatsHeader from "@/components/ui/user-stats-header";
import JoinRoomBar from "@/components/ui/join-room-bar";
import EngineCoreWidget from "@/components/ui/engine-core-widget";
import ActiveRoomsWidget from "@/components/ui/active-rooms-widget";
import GlobalChatWidget from "@/components/ui/global-chat-widget";
import StudyChecklistWidget from "@/components/ui/study-checklist-widget";

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
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      <main className="flex flex-col items-center justify-center min-h-screen w-full">
        <GooeyLoader />
      </main>
    );
  }

  return (
    <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto w-full z-20 relative">

      <UserStatsHeader profile={profile} levelInfo={levelInfo} />
      
      <JoinRoomBar 
        joinCode={joinCode} 
        setJoinCode={setJoinCode} 
        handleJoinByCode={handleJoinByCode} 
        joinError={joinError} 
      />

      {/* Bento Layout Grid */}
      <section className="bento-grid gap-6">
        
        <ActiveRoomsWidget 
          rooms={rooms} 
          participantCounts={participantCounts} 
          handleQuickJoin={handleQuickJoin} 
          setShowCreateModal={setShowCreateModal} 
        />

        {/* Engine Core (Timer Widget) */}
        <EngineCoreWidget profile={profile} />
        {/* Ambient Sound Mixer Panel */}
        <div className="flex flex-col min-h-[340px] bg-white/5 border border-white/10 rounded-2xl relative group overflow-hidden shadow-sm hover:border-white/20 transition-colors lg:col-span-4 xl:col-span-3 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
              <Music size={16} className="text-zinc-400" />
              Ambient sound deck
            </h2>
            <span className="text-[9px] bg-white/10 border border-white/10 text-zinc-400 font-bold px-2 py-0.5 rounded-sm tracking-widest uppercase">
              PRO MODULE
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center p-4 relative">
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-sm mb-3 transform group-hover:scale-110 transition-transform duration-300">
                <Lock size={18} />
              </div>
              <p className="text-sm font-bold text-white tracking-wide">Ambient Audio Mixer</p>
              <p className="text-xs text-zinc-400 max-w-[200px] mt-1">
                Customize rain, fireplace, cafe, and lofi streams under <span className="text-white font-semibold">Sessions Pro</span>.
              </p>
            </div>

            <div className="w-full space-y-4 opacity-20 filter blur-[1.5px] select-none pointer-events-none">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-500 w-16 text-left">Lofi Radio</span>
                <input type="range" disabled className="flex-1 h-1 bg-white/10 rounded-lg accent-white" />
                <Volume2 size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-500 w-16 text-left">Rain Storm</span>
                <input type="range" disabled className="flex-1 h-1 bg-white/10 rounded-lg accent-white" />
                <Volume2 size={14} className="text-zinc-500" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-500 w-16 text-left">Fireplace</span>
                <input type="range" disabled className="flex-1 h-1 bg-white/10 rounded-lg accent-white" />
                <Volume2 size={14} className="text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        <GlobalChatWidget 
          chatMessages={messages} 
          chatInput={chatInput} 
          setChatInput={setChatInput} 
          handleSendMessage={handleSendMessage} 
          chatEndRef={chatEndRef} 
        />

        <StudyChecklistWidget 
          tasks={tasks} 
          newTaskTitle={newTodo} 
          setNewTaskTitle={setNewTodo} 
          handleAddTask={handleAddTask} 
          toggleTaskCompletion={handleToggleTask} 
          deleteTask={handleDeleteTask} 
        />

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
