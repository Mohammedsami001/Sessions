"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { profileService, chatService, taskService, roomService } from "../../../lib/container";
import type { Profile, Room, Task, MessageWithProfile } from "../../../lib/types";
import { computeTimerRemaining } from "../../../lib/types";
import { 
  ArrowLeft, Users, Clock, Timer, MessageSquare, CheckSquare, 
  Trash2, ShieldAlert, Share2, Play, Pause, RotateCcw, 
  Activity, Crown, Plus, Check, Send, Sparkles, BookOpen, AlertTriangle
} from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { GooeyLoader } from "@/components/ui/loader-10";
import ComplexTaskTrackerWidget from "@/components/ui/complex-task-tracker-widget";
import RoomLeaderboardWidget from "@/components/ui/room-leaderboard-widget";
import GlobalChatWidget from "@/components/ui/global-chat-widget";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const [roomTasks, setRoomTasks] = useState<Task[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [newTaskInput, setNewTaskInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [timerDisplay, setTimerDisplay] = useState({
    minutes: 25,
    seconds: 0,
    totalRemaining: 1500,
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isHost = room?.host_id === currentUserId;

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    const p = await roomService.fetchParticipants(roomId);
    setParticipants(p);
  }, [roomId]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    const m = await chatService.fetchRecentMessages(roomId, 100);
    setMessages(m);
  }, [roomId]);

  const loadTasks = useCallback(async () => {
    const allTasks = await taskService.fetchTasks(null);
    setGlobalTasks(allTasks.filter((t: Task) => t.scope === 'global'));
    
    if (roomId) {
      const rTasks = await taskService.fetchTasks(roomId);
      setRoomTasks(rTasks.filter((t: Task) => t.scope === 'room'));
    }
  }, [roomId]);

  const updateTimerDisplay = useCallback((r: Room) => {
    const t = computeTimerRemaining(
      r.timer_started_at,
      r.timer_status,
      r.focus_duration,
      r.break_duration,
      r.long_break_duration,
    );
    setTimerDisplay(t);
  }, []);

  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        const p = await profileService.ensureProfile(session.user.id, session.user.email || undefined, session.user.user_metadata);
        setProfile(p);
      }
      const r = await roomService.fetchRoom(roomId);
      if (r) {
        setRoom(r);
        updateTimerDisplay(r);
      }
      setLoading(false);
      await Promise.all([loadParticipants(), loadMessages(), loadTasks()]);
    }
    init();

    const roomSub = roomService.subscribeToRoom(roomId, (updated) => {
      setRoom(updated);
      updateTimerDisplay(updated);
    });
    const partSub = roomService.subscribeToParticipants(roomId, () => loadParticipants());
    const chatSub = chatService.subscribeToMessages(roomId, () => loadMessages());

    // Listen for room deletion — redirect all users to dashboard
    const deleteSub = supabase
      .channel(`room-delete-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          window.location.href = "/dashboard";
        },
      )
      .subscribe();

    return () => {
      roomSub.unsubscribe();
      partSub.unsubscribe();
      chatSub.unsubscribe();
      supabase.removeChannel(deleteSub);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [roomId, loadParticipants, loadMessages, loadTasks, updateTimerDisplay]);

  // Live timer tick (client-side countdown from anchor)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (room && room.timer_status !== "idle" && room.timer_started_at) {
      timerRef.current = setInterval(() => {
        const t = computeTimerRemaining(
          room.timer_started_at,
          room.timer_status,
          room.focus_duration,
          room.break_duration,
          room.long_break_duration,
        );
        setTimerDisplay(t);
        // Auto-complete when timer hits zero
        if (t.totalRemaining <= 0 && isHost) {
          clearInterval(timerRef.current!);
          const nextCycles = (room.cycles_completed || 0) + 1;
          const isLongBreak =
            room.timer_status === "focus" &&
            nextCycles % room.long_break_interval === 0;
          if (room.timer_status === "focus") {
            roomService.completeTimerCycle(roomId, isLongBreak ? "long_break" : "break");
          } else {
            roomService.startTimer(roomId, "focus");
          }
        }
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room, roomId, isHost]);

  const handleLeave = async () => {
    if (!currentUserId) return;
    await roomService.leaveRoom(roomId, currentUserId);
    window.location.href = "/dashboard";
  };
  const handleDelete = async () => {
    if (!currentUserId) return;
    const ok = await roomService.deleteRoom(roomId, currentUserId);
    if (ok) window.location.href = "/dashboard";
    setShowDeleteConfirm(false);
  };
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !profile) return;
    const msg = await chatService.sendMessage(chatInput, profile.id, roomId);
    if (msg) {
      setChatInput("");
      await loadMessages();
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAddTask = async (taskData: Partial<Task>) => {
    if (!taskData.text?.trim() || !profile) return;
    const targetRoom = taskData.scope === 'room' ? roomId : null;
    const optimisticTask: Task = {
      ...taskData,
      id: `temp-${Date.now()}`,
      text: taskData.text.trim(),
      completed: false,
      user_id: profile.id,
      room_id: targetRoom,
      scope: taskData.scope || 'global',
      created_at: new Date().toISOString()
    } as Task;

    if (taskData.scope === 'room') setRoomTasks(prev => [...prev, optimisticTask]);
    else setGlobalTasks(prev => [...prev, optimisticTask]);
    
    await taskService.createTask({
      text: optimisticTask.text, 
      user_id: profile.id, 
      room_id: targetRoom,
      scope: optimisticTask.scope,
      priority: optimisticTask.priority,
      tags: optimisticTask.tags,
      dueDate: optimisticTask.dueDate
    });
    await loadTasks();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    setGlobalTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    setRoomTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    await taskService.toggleTask(taskId, completed);
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    setGlobalTasks(prev => prev.filter(t => t.id !== taskId));
    setRoomTasks(prev => prev.filter(t => t.id !== taskId));
    await taskService.deleteTask(taskId);
    await loadTasks();
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    setGlobalTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    setRoomTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    await taskService.updateTask(taskId, updates);
    await loadTasks();
  };

  const handleCopyCode = () => {
    if (room?.join_code) {
      navigator.clipboard.writeText(room.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const timerColor =
    room?.timer_status === "focus"
      ? "var(--orange)"
      : room?.timer_status === "idle"
        ? "var(--text-gray)"
        : "#3B82F6";
  const conicProgress =
    room && room.timer_status !== "idle"
      ? (() => {
          let dur = room.focus_duration;
          if (room.timer_status === "break") dur = room.break_duration;
          if (room.timer_status === "long_break")
            dur = room.long_break_duration;
          return Math.max(0, (timerDisplay.totalRemaining / dur) * 100);
        })()
      : 100;

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6">
        <GooeyLoader />
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-black text-white mb-4 tracking-tight">Room Not Found</h1>
          <p className="text-text-gray mb-8 leading-relaxed text-sm">
            The room you are seeking does not exist or has been deleted by the host.
          </p>
          <Link 
            href="/dashboard" 
            className="no-underline text-bg-deep bg-gold hover:bg-white px-6 py-3 rounded-lg text-xs font-black tracking-widest uppercase cursor-pointer transition-colors mt-2"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="flex-1 w-full bg-bg-deep px-4 md:px-8 py-8 relative overflow-hidden text-text-white font-sans max-w-7xl mx-auto z-20">
      
      {/* Absolute background accent glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange/3 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Translucent Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 bg-glass/40 backdrop-blur-md border border-border px-6 py-3 rounded-2xl md:rounded-full shadow-sm hover:border-border-hover transition-colors">
        <Link 
          href="/dashboard" 
          className="no-underline text-text-gray text-xs md:text-sm font-semibold tracking-wider hover:text-text-white flex items-center gap-2 group transition-colors select-none"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>RETURN TO DASHBOARD</span>
        </Link>
        
        <div className="flex flex-wrap items-center gap-3">
          {room.join_code && (
            <button 
              onClick={handleCopyCode}
              className="bg-gold-dim border border-gold-border/30 hover:border-gold text-gold font-bold px-4 py-2 rounded-xl text-xs tracking-widest uppercase cursor-pointer flex items-center gap-2 transition-all active:scale-95"
              title="Click to copy join code to clipboard"
            >
              <Share2 size={13} />
              <span>CODE: {room.join_code}</span>
              {copied && <span className="text-[10px] text-white bg-green px-1.5 py-0.5 rounded ml-1 animate-fade-in font-bold">COPIED</span>}
            </button>
          )}
          
          {isHost && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#E1E0CC] opacity-60">HOST CONTROLS</span>
            </div>
          )}
          
          <button 
            onClick={handleLeave} 
            className="bg-glass hover:bg-white hover:text-bg-deep border border-border/80 text-text-gray hover:border-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all duration-300"
          >
            Leave Room
          </button>
          
          {isHost && (
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="bg-red-dim hover:bg-red border border-red/30 hover:border-red text-red hover:text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all duration-300"
            >
              Terminate
            </button>
          )}
        </div>
      </div>

      {/* Header Info Panel */}
      <header className="relative mb-8 bg-gradient-to-r from-bg-card to-bg-card/90 backdrop-blur-3xl border border-border/80 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md hover:border-border-hover transition-all duration-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-glass border border-border flex items-center justify-center text-gold shadow-sm shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <span className="text-[9px] bg-gold-dim border border-gold-border/30 text-gold font-bold px-2.5 py-0.5 rounded-full tracking-widest uppercase">
              {room.category}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-text-white tracking-tight mt-1">
              {room.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-glass border border-border/60 px-4 py-2 rounded-xl">
          <Users size={14} className="text-text-gray" />
          <span className="text-xs text-text-gray font-semibold">
            <span className="text-text-white font-bold">{participants.length}</span> peers in room
          </span>
        </div>
      </header>

      {/* 3-Column Cockpit Layout Grid */}
      <section className="flex gap-5 flex-1 min-h-[500px] pb-6 relative overflow-hidden">
        
        {/* Left Column: Planning (Tasks) */}
        <div data-testid="left-column-tasks" className="w-[320px] shrink-0 h-full hidden lg:block">
          <ComplexTaskTrackerWidget 
            tasks={[...globalTasks, ...roomTasks]}
            currentRoomId={roomId}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </div>

        {/* Center Column: Execution (Timer) */}
        <div data-testid="center-column-execution" className="flex-1 flex flex-col gap-5 min-w-0 transition-all duration-300">
          
          <div className="bento-card flex flex-col justify-center items-center text-center bg-gradient-to-b from-bg-card to-bg-card/85 relative overflow-hidden h-full p-6 shadow-md border border-border rounded-2xl group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange/50 via-gold/50 to-transparent"></div>
            
            {/* Mode headers switcher teaser */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap w-full">
              {(["focus", "break", "long_break"] as const).map((mode) => {
                const isActive = room.timer_status === mode;
                const isPaused = !room.timer_started_at || room.timer_status === "idle";
                const isClickable = isHost && isPaused;

                return (
                  <button
                    key={mode}
                    onClick={() => isClickable && roomService.switchTimerMode(roomId, mode)}
                    disabled={!isClickable}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border transition-all ${
                      isActive
                        ? mode === "focus"
                          ? "bg-orange/10 border-orange text-orange"
                          : "bg-blue-dim border-blue text-blue"
                        : isClickable
                          ? "bg-black/30 border-border text-text-gray hover:border-border-hover cursor-pointer"
                          : "bg-transparent border-transparent text-text-muted cursor-default opacity-50"
                    }`}
                  >
                    {mode.replace("_", " ")}
                  </button>
                );
              })}
            </div>

            {/* Glowing Conic Countdown Circle */}
            <div 
              className="relative w-48 h-48 rounded-full flex items-center justify-center p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.4)] mb-5 transition-all duration-500"
              style={{
                background: `conic-gradient(${timerColor} 0% ${conicProgress}%, rgba(255,255,255,0.04) ${conicProgress}% 100%)`,
              }}
            >
              <div className="absolute inset-1 rounded-full bg-bg-deep/95 backdrop-blur-lg flex flex-col items-center justify-center z-10 border border-border/80">
                <div className="text-4xl md:text-5xl font-black text-text-white tracking-tighter leading-none select-none font-sans">
                  {String(timerDisplay.minutes).padStart(2, "0")}:
                  {String(timerDisplay.seconds).padStart(2, "0")}
                </div>
                <div 
                  className="text-[9px] font-bold tracking-widest mt-3 uppercase select-none flex items-center gap-1.5"
                  style={{ color: timerColor }}
                >
                  <span className="relative flex h-2 w-2">
                    {room.timer_status !== "idle" && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: timerColor }}></span>
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: timerColor }}></span>
                  </span>
                  {room.timer_status === "idle" ? "READY STATE" : room.timer_status.replace("_", " ")}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-text-muted font-bold tracking-widest uppercase mb-4">
              INTERVAL CYCLE: <span className="text-text-white font-extrabold">{room.cycles_completed}</span> / <span className="text-text-white font-extrabold">{room.long_break_interval}</span>
            </div>

            {/* Host controllers */}
            {isHost && (
              <div className="flex gap-3 justify-center w-full max-w-xs mt-2">
                {!room.timer_started_at ? (
                  <button
                    onClick={() =>
                      roomService.startTimer(
                        roomId,
                        (room.timer_status === "idle" ? "focus" : room.timer_status) as any
                      )
                    }
                    className="flex-1 bg-gradient-to-r from-gold to-orange hover:from-white hover:to-white text-bg-deep font-black text-xs tracking-widest uppercase py-3.5 px-4 rounded-xl cursor-pointer shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1"
                  >
                    <Play size={12} fill="currentColor" />
                    <span>START {room.timer_status === "idle" ? "FOCUS" : room.timer_status.toUpperCase().replace("_", " ")}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => roomService.pauseTimer(roomId)}
                      className="flex-1 bg-white hover:bg-glass hover:text-white border border-transparent hover:border-border text-bg-deep font-black text-xs tracking-widest uppercase py-3.5 rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1"
                    >
                      <Pause size={12} fill="currentColor" />
                      PAUSE
                    </button>
                    <button
                      onClick={() => roomService.resetTimer(roomId)}
                      className="bg-glass hover:bg-glass-hover border border-border text-text-gray hover:text-white px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer transition-all flex items-center justify-center gap-1"
                      title="Reset countdown"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </>
                )}
              </div>
            )}

            {!isHost && (
              <div className="w-full bg-glass/60 border border-border/80 px-4 py-3.5 rounded-xl text-center flex items-center justify-center gap-2 max-w-sm mt-2">
                <Clock size={13} className="text-text-muted animate-pulse" />
                <span className="text-[10px] text-text-gray font-semibold tracking-wide">
                  Countdown state synchronized under room host controls.
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Community (Leaderboard & Chat) */}
        <div data-testid="right-column-community" className="w-[320px] shrink-0 h-full hidden xl:flex flex-col gap-5">
          <RoomLeaderboardWidget participants={participants} />
          <GlobalChatWidget 
            chatMessages={messages} 
            chatInput={chatInput} 
            setChatInput={setChatInput} 
            handleSendMessage={handleSendMessage} 
            chatEndRef={chatEndRef} 
          />
        </div>

      </section>

      {/* Delete/Terminate Confirmation modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="w-full max-w-md bg-bg-surface border border-red/30 rounded-2xl shadow-2xl p-6 md:p-8 relative text-center overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-red"></div>
            
            <div className="w-12 h-12 rounded-full bg-red-dim border border-red/20 text-red flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg font-bold text-red tracking-tight mb-2">
              Terminate Study Session?
            </h3>
            
            <p className="text-xs text-text-gray leading-relaxed mb-6">
              This action will <strong className="text-text-white">permanently delete</strong> the room. Everyone currently inside this room will be automatically redirected to their dashboards.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="flex-1 bg-glass hover:bg-glass-hover border border-border text-text-gray hover:text-white py-3 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="flex-1 bg-red hover:bg-red-hover text-white border-none py-3 rounded-lg font-black text-xs tracking-widest uppercase cursor-pointer shadow-md transition-colors"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
      
      </main>
      <Footer />
    </div>
  );
}
