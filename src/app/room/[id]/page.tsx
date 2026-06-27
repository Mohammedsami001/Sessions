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

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [globalTasks, setGlobalTasks] = useState<Task[]>([]);
  const [roomTasks, setRoomTasks] = useState<Task[]>([]);
  const [taskTab, setTaskTab] = useState<"global" | "room">("room");
  const [chatInput, setChatInput] = useState("");
  const [newTask, setNewTask] = useState("");
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
    const g = await taskService.fetchTasks(null);
    setGlobalTasks(g);
    if (roomId) {
      const r = await taskService.fetchTasks(roomId);
      setRoomTasks(r);
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
  const handleSend = async () => {
    if (!chatInput.trim() || !currentUserId) return;
    await chatService.sendMessage(chatInput, currentUserId, roomId);
    setChatInput("");
    await loadMessages();
  };
  
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !currentUserId) return;
    
    // Optimistic
    const tempId = `temp-${Date.now()}`;
    const targetRoom = taskTab === "room" ? roomId : null;
    const optTask = {
      id: tempId,
      text: newTask.trim(),
      completed: false,
      user_id: currentUserId,
      room_id: targetRoom,
      created_at: new Date().toISOString()
    };
    
    if (targetRoom) setRoomTasks(prev => [...prev, optTask]);
    else setGlobalTasks(prev => [...prev, optTask]);
    
    setNewTask("");
    await taskService.createTask(optTask.text, currentUserId, targetRoom);
    await loadTasks();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await taskService.toggleTask(taskId, completed);
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
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
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-gold-border/20 border-t-gold animate-spin"></div>
          <p className="text-text-gray font-medium tracking-wider text-sm animate-pulse">ESTABLISHING SYNCHRONIZED INTERLINK...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-bg-card border border-border p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
          <div className="text-4xl text-orange">⚠️</div>
          <h2 className="text-xl font-bold text-text-white">SYNCHRONIZED ROOM NOT FOUND</h2>
          <p className="text-xs text-text-gray max-w-xs leading-relaxed">
            The studio station you are seeking does not exist or has been deleted by the host console.
          </p>
          <Link 
            href="/dashboard" 
            className="no-underline text-bg-deep bg-gold hover:bg-white px-6 py-3 rounded-lg text-xs font-black tracking-widest uppercase cursor-pointer transition-colors mt-2"
          >
            RETURN TO COMMAND PANEL
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
            <span className="bg-orange-dim border border-orange-dim text-orange px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
              <Crown size={12} />
              HOST CONSOLE
            </span>
          )}
          
          <button 
            onClick={handleLeave} 
            className="bg-glass hover:bg-white hover:text-bg-deep border border-border/80 text-text-gray hover:border-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider cursor-pointer transition-all duration-300"
          >
            Leave Station
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
            <span className="text-text-white font-bold">{participants.length}</span> study peers synched
          </span>
        </div>
      </header>

      {/* Room layout bento grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pomodoro Circle and Hosts panels */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          
          {/* Synchronized Pomodoro card */}
          <div className="bento-card flex flex-col justify-center items-center text-center bg-gradient-to-b from-bg-card to-bg-card/85 relative overflow-hidden min-h-[460px] p-6 shadow-md border border-border rounded-2xl group">
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
                    title={
                      isClickable
                        ? `Switch interval to ${mode.replace("_", " ")}`
                        : "Start/pause the timer core to adjust interval mode"
                    }
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

          {/* Active Participants card */}
          <div className="bento-card bg-gradient-to-b from-bg-card to-bg-card/85 p-6 border border-border rounded-2xl">
            <h2 className="text-sm font-extrabold text-text-white tracking-widest uppercase flex items-center gap-2 mb-4">
              <Users size={16} className="text-gold" />
              PEERS CONSOLE ({participants.length})
            </h2>
            <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto scrollbar-thin scrollbar-thumb-glass pr-1">
              {participants.map((p: any) => (
                <div 
                  key={p.id} 
                  className="bg-glass border border-border hover:border-border-hover py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors group"
                >
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
                  </span>
                  
                  <span 
                    className="text-xs font-bold tracking-wide"
                    style={{ color: p.user_id === room.host_id ? "var(--gold)" : "var(--text-white)" }}
                  >
                    {p.profiles?.display_name || "Student"}
                  </span>
                  
                  {p.user_id === room.host_id && (
                    <span className="text-[8px] bg-gold-dim border border-gold-border/20 text-gold font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 tracking-wider uppercase ml-1">
                      HOST
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Chat and Tasks Bento Split */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 w-full">
          
          {/* Chat Stream card */}
          <div className="bento-card flex flex-col bg-gradient-to-b from-bg-card to-bg-card/85 p-6 border border-border rounded-2xl min-h-[380px] lg:min-h-[400px]">
            <div className="bento-header flex justify-between items-center mb-4">
              <h2 className="bento-title text-base font-extrabold flex items-center gap-2">
                <MessageSquare size={16} className="text-gold" />
                Live Classroom Thread
              </h2>
            </div>

            {/* Chat list */}
            <div className="chat-stream flex-1 overflow-y-auto space-y-3 pr-1 mb-4 max-h-[220px] lg:max-h-[250px] scrollbar-thin scrollbar-thumb-glass">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-full opacity-60 py-10">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-text-gray text-xs font-semibold">Study stream is quiet. Send a word of focus!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className="chat-message bg-glass/40 border border-border/40 hover:border-border-hover/50 p-3 rounded-xl flex flex-col gap-0.5 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="chat-user text-[11px] font-bold text-gold tracking-wide uppercase flex items-center gap-1">
                        {msg.profiles?.display_name || "Anon"}
                        {msg.user_id === room.host_id && (
                          <span className="text-[7px] bg-gold-dim border border-gold-border/20 px-1 rounded text-gold font-bold tracking-wider">HOST</span>
                        )}
                      </span>
                    </div>
                    <span className="text-xs text-text-white/95 break-words font-medium mt-1">
                      {msg.content}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 border-t border-border/40 pt-4 mt-auto">
              <input 
                type="text" 
                placeholder="TRANSMIT MESSAGE TO ROOM..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }} 
                className="flex-1 bg-black/40 border border-border focus:border-gold/60 focus:ring-1 focus:ring-gold/30 px-3 py-2.5 rounded-lg text-xs text-text-white placeholder:text-text-muted outline-none transition-all"
              />
              <button 
                onClick={handleSend} 
                className="bg-gold hover:bg-white text-bg-deep px-4 py-2.5 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center shrink-0"
              >
                <Send size={13} />
              </button>
            </div>

          </div>

          {/* Tasks checklist card */}
          <div className="bento-card flex flex-col bg-gradient-to-b from-bg-card to-bg-card/85 p-6 border border-border rounded-2xl min-h-[380px] lg:min-h-[400px]">
            
            {/* Tabs Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 w-full">
              <h2 className="bento-title text-base font-extrabold flex items-center gap-2">
                <CheckSquare size={16} className="text-orange" />
                Interval Tasks Grid
              </h2>
              
              <div className="flex gap-1.5 p-0.5 bg-glass border border-border/80 rounded-xl w-full sm:w-auto">
                {(["room", "global"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTaskTab(tab)}
                    className={`flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[9px] font-black tracking-widest uppercase cursor-pointer transition-all border border-transparent ${
                      taskTab === tab
                        ? "bg-orange-dim border-orange/20 text-orange"
                        : "bg-transparent text-text-gray hover:text-text-white"
                    }`}
                  >
                    {tab === "room" ? "ROOM INDEX" : "PERSONAL TASKS"}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field to add task */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4 w-full">
              <input 
                type="text" 
                placeholder={`ADD NEURAL TASK FOR ${taskTab.toUpperCase()} BOARD...`} 
                value={newTask} 
                onChange={(e) => setNewTask(e.target.value)} 
                className="flex-1 bg-black/40 border border-border focus:border-orange/60 focus:ring-1 focus:ring-orange/30 px-3 py-2.5 rounded-lg text-xs text-text-white placeholder:text-text-muted outline-none transition-all"
              />
              <button 
                type="submit" 
                className="bg-glass hover:bg-orange hover:text-white border border-border hover:border-orange px-4 rounded-lg text-xs font-bold cursor-pointer transition-all shrink-0"
              >
                +
              </button>
            </form>

            {/* Checklist items */}
            <div className="todo-list flex-1 overflow-y-auto space-y-2.5 max-h-[180px] lg:max-h-[210px] pr-1 scrollbar-thin scrollbar-thumb-glass">
              {((taskTab === "room" ? roomTasks : globalTasks) || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-28 opacity-60 py-6">
                  <p className="text-text-gray text-xs font-medium">All tasks cleared. Good work!</p>
                </div>
              ) : (
                (taskTab === "room" ? roomTasks : globalTasks).map((t) => (
                  <div 
                    key={t.id} 
                    className={`todo-item bg-glass/20 border border-border/30 hover:border-border-hover/50 p-2.5 rounded-lg flex items-center justify-between gap-3 group transition-all duration-200 ${t.completed ? "opacity-40 line-through bg-black/10" : ""}`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={t.completed} 
                        onChange={() => handleToggleTask(t.id, !t.completed)}
                        className="accent-orange rounded cursor-pointer w-4 h-4 shrink-0"
                      />
                      <span className="text-xs text-text-white font-medium truncate leading-tight select-none">
                        {t.text}
                      </span>
                    </label>
                    
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteTask(t.id);
                      }} 
                      className="bg-transparent border-0 text-text-muted hover:text-red cursor-pointer p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

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
              This action will <strong className="text-text-white">permanently delete</strong> the synchronized classroom. Everyone currently focused inside this station will be automatically redirected to their dashboards.
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
                Delete Station
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
