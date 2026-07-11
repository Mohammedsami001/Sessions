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
  Globe, Lock, ArrowLeft, Send, Check, Volume2, PlusCircle, Crown, Settings2
} from "lucide-react";
import { GooeyLoader } from "../../components/ui/loader-10";
import UserStatsHeader from "@/components/ui/user-stats-header";
import JoinRoomBar from "@/components/ui/join-room-bar";
import EngineCoreWidget from "@/components/ui/engine-core-widget";
import ActiveRoomsWidget from "@/components/ui/active-rooms-widget";
import GlobalChatWidget from "@/components/ui/global-chat-widget";
import StudyChecklistWidget from "@/components/ui/study-checklist-widget";
import StatCardsWidget from "@/components/ui/stat-cards-widget";
import ComplexTaskTrackerWidget from "@/components/ui/complex-task-tracker-widget";

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
  
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
  const [roomsSidebarOpen, setRoomsSidebarOpen] = useState(false);

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

  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!taskData.text?.trim() || !profile) return;
    
    // Optimistic UI for tasks
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = {
      ...taskData,
      id: tempId,
      text: taskData.text.trim(),
      completed: false,
      user_id: profile.id,
      room_id: null,
      scope: taskData.scope || 'global',
      created_at: new Date().toISOString()
    } as Task;
    
    setTasks(prev => [...prev, optimisticTask]);
    
    const savedTask = await taskService.createTask({
      text: optimisticTask.text, 
      user_id: profile.id, 
      room_id: null,
      scope: optimisticTask.scope,
      priority: optimisticTask.priority,
      tags: optimisticTask.tags,
      dueDate: optimisticTask.dueDate
    });
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
    if (!success) setTasks(backup);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const backup = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    const success = await taskService.updateTask(taskId, updates);
    if (!success) setTasks(backup);
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
    <main className="px-8 py-6 max-w-[1600px] mx-auto w-full h-screen flex flex-col relative overflow-hidden z-20">

      <UserStatsHeader profile={profile} />
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 w-full shrink-0">
        <div className="w-full lg:flex-1">
          <JoinRoomBar 
            joinCode={joinCode} 
            setJoinCode={setJoinCode} 
            handleJoinByCode={handleJoinByCode} 
            joinError={joinError} 
          />
        </div>
        <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          <StatCardsWidget profile={profile} levelInfo={levelInfo} />
        </div>
      </div>

      {/* 3-Column Cockpit Layout Grid */}
      <section className="flex gap-5 flex-1 min-h-0 pb-6 relative overflow-hidden">
        
        {/* Left Column: Planning (Tasks) */}
        <div data-testid="left-column-tasks" className="w-[320px] shrink-0 h-full hidden lg:block">
          <ComplexTaskTrackerWidget 
            tasks={tasks}
            currentRoomId={null}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </div>

        {/* Center Column: Execution (Timer) */}
        <div data-testid="center-column-execution" className="flex-1 flex flex-col gap-5 min-w-0 transition-all duration-300">
          <EngineCoreWidget profile={profile} />
        </div>

        {/* Right Column: Community (Rooms & Chat) */}
        <div data-testid="right-column-community" className="w-[320px] shrink-0 h-full flex flex-col bg-black/40 border border-white/5 rounded-2xl p-4 hidden xl:flex">
           <h2 className="text-sm font-bold text-white mb-4">Community</h2>
           <div className="flex-1 overflow-y-auto">
             {/* Tickets 4 & 5 will build Community Sidebars here */}
             <p className="text-xs text-zinc-500">Community Sidebar Placeholder</p>
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
                  Host a Room
                </h3>
                <p className="text-xs text-text-gray mt-1">Set up your shared focus space</p>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Focus Duration</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[15, 25, 45, 60].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, focus_duration: m * 60 })}
                          className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-md transition-all border ${createForm.focus_duration === m * 60 ? 'bg-gold/20 text-gold border-gold/50' : 'bg-black/40 text-text-gray border-border hover:border-white/20 hover:text-white'}`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Short Break</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[3, 5, 10, 15].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, break_duration: m * 60 })}
                          className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-md transition-all border ${createForm.break_duration === m * 60 ? 'bg-gold/20 text-gold border-gold/50' : 'bg-black/40 text-text-gray border-border hover:border-white/20 hover:text-white'}`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Long Break</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 15, 20, 30].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, long_break_duration: m * 60 })}
                          className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-md transition-all border ${createForm.long_break_duration === m * 60 ? 'bg-gold/20 text-gold border-gold/50' : 'bg-black/40 text-text-gray border-border hover:border-white/20 hover:text-white'}`}
                        >
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Interval Cycles</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setCreateForm({ ...createForm, long_break_interval: n })}
                          className={`flex-1 min-w-[40px] py-1.5 text-xs font-bold rounded-md transition-all border ${createForm.long_break_interval === n ? 'bg-gold/20 text-gold border-gold/50' : 'bg-black/40 text-text-gray border-border hover:border-white/20 hover:text-white'}`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
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
