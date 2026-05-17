"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { fetchCurrentProfile } from "../../lib/profile";
import { fetchPublicRooms, createRoom, joinRoom, joinRoomByCode, subscribeToPublicRooms, subscribeToPublicParticipants, fetchParticipantCounts } from "../../lib/rooms";
import { fetchRecentMessages, sendMessage, subscribeToMessages } from "../../lib/chat";
import { fetchTasks, createTask, toggleTask, deleteTask } from "../../lib/tasks";
import type { Profile, Room, Task, MessageWithProfile, CreateRoomInput } from "../../lib/types";
import { computeLevelProgress, formatFocusHours, computeTimerRemaining } from "../../lib/types";

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
  const [createForm, setCreateForm] = useState<CreateRoomInput>({
    title: "", category: "General", visibility: "public",
    focus_duration: 1500, break_duration: 300, long_break_duration: 900, long_break_interval: 4,
  });

  const loadRooms = useCallback(async () => {
    const r = await fetchPublicRooms();
    setRooms(r);
    if (r.length > 0) {
      const counts = await fetchParticipantCounts(r.map(room => room.id));
      setParticipantCounts(counts);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    const m = await fetchRecentMessages(null, 30);
    setMessages(m);
  }, []);

  const loadTasks = useCallback(async () => {
    const t = await fetchTasks(null);
    setTasks(t);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const p = await fetchCurrentProfile();
        setProfile(p);
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
    const roomSub = subscribeToPublicRooms(() => loadRooms());
    const partSub = subscribeToPublicParticipants(() => loadRooms());
    const chatSub = subscribeToMessages(null, () => loadMessages());

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(partSub);
      supabase.removeChannel(chatSub);
    };
  }, [loadRooms, loadMessages, loadTasks]);

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatError("");
    const msg = await sendMessage(chatInput);
    if (msg) {
      setChatInput("");
      await loadMessages();
    } else {
      setChatError("Failed to send. Are you signed in?");
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await createTask(newTodo);
    setNewTodo("");
    await loadTasks();
  };

  const handleToggleTodo = async (id: string, completed: boolean) => {
    await toggleTask(id, !completed);
    await loadTasks();
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTask(id);
    await loadTasks();
  };

  const handleCreateRoom = async () => {
    if (!createForm.title.trim()) return;
    setCreateError("");
    const room = await createRoom(createForm);
    if (room) {
      setShowCreateModal(false);
      window.location.href = `/room/${room.id}`;
    } else {
      setCreateError("Failed to create room. Please make sure you're signed in.");
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setJoinError("");
    const { room, error } = await joinRoomByCode(joinCode);
    if (error) { setJoinError(error); return; }
    if (room) window.location.href = `/room/${room.id}`;
  };

  const handleJoinRoom = async (roomId: string) => {
    await joinRoom(roomId);
    window.location.href = `/room/${roomId}`;
  };

  const levelInfo = profile ? computeLevelProgress(profile.exp) : { level: 0, currentExp: 0, nextLevelExp: 100, progress: 0 };

  if (loading) return <main className="dashboard-wrapper"><p style={{ textAlign: 'center', color: 'var(--text-gray)', marginTop: '100px' }}>Loading workspace...</p></main>;

  return (
    <main className="dashboard-wrapper">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-gray)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>← <span style={{ color: 'white' }}>Lobby</span></Link>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--gold)', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(255,215,0,0.3)', padding: '6px 12px', borderRadius: '6px' }}>Profile</Link>
          <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-gray)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </div>

      <header className="dashboard-header">
        <div className="dashboard-user-info">
          <div className="dashboard-avatar">{profile?.display_name?.charAt(0).toUpperCase() || '?'}</div>
          <div className="dashboard-greeting">
            <h1 className="dashboard-greeting-title">Welcome back, <span style={{ color: 'var(--gold)' }}>{profile?.display_name || 'Student'}</span></h1>
            <p className="dashboard-greeting-subtitle">Multiplayer Workspace Status: <span style={{ color: '#10B981', fontWeight: 600 }}>Connected</span></p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="dashboard-badge">✦ LEVEL {levelInfo.level} PROTOCOL ✦</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.05)' }}>
            Total Focus: <span style={{ color: 'white', fontWeight: 700 }}>{formatFocusHours(profile?.total_focus_seconds || 0)}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.05)' }}>
            EXP: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{profile?.exp || 0}</span>
          </div>
        </div>
      </header>

      {/* Join by Code bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
        <input type="text" placeholder="Enter room code..." value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} style={{ background: 'rgba(10,15,30,0.45)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', width: '200px', outline: 'none', textTransform: 'uppercase' }} />
        <button onClick={handleJoinByCode} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>JOIN BY CODE</button>
        {joinError && <span style={{ color: '#FCA5A5', fontSize: '12px' }}>{joinError}</span>}
      </div>

      <section className="bento-grid">
        {/* Rooms Card */}
        <div className="bento-card bento-rooms">
          <div className="bento-header">
            <h2 className="bento-title"><span className="bento-icon">✦</span> Active Study Rooms</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{rooms.length} Public Sessions</span>
          </div>
          <div className="room-list">
            {rooms.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '40px 0', fontSize: '13px' }}>No active rooms yet. Create one to get started!</div>
            ) : rooms.map(room => {
              const timer = computeTimerRemaining(room.timer_started_at, room.timer_status, room.focus_duration, room.break_duration, room.long_break_duration);
              return (
                <div key={room.id} className="room-item">
                  <div className="room-item-info">
                    <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{room.category}</span>
                    <div className="room-item-title">{room.title}</div>
                    <div className="room-item-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="online-dot"></span> {participantCounts[room.id] || 0} peers</span>
                      <span>•</span>
                      <span style={{ color: room.timer_status === 'focus' ? 'var(--orange)' : room.timer_status === 'idle' ? 'var(--text-gray)' : '#3B82F6', fontWeight: 600 }}>
                        ⏱ {room.timer_status === 'idle' ? 'Idle' : `${String(timer.minutes).padStart(2,'0')}:${String(timer.seconds).padStart(2,'0')} ${room.timer_status.replace('_',' ')}`}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleJoinRoom(room.id)} className="btn-join">JOIN ROOM</button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Want to host your own shared interval timer?</span>
            <button onClick={() => setShowCreateModal(true)} style={{ background: 'var(--gold)', border: 'none', color: 'black', fontWeight: 700, fontSize: '12px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>+ Create Room</button>
          </div>
        </div>

        {/* Pomodoro Card — local preview, real timer inside room */}
        <div className="bento-card bento-pomodoro">
          <div style={{ width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-gray)', margin: '0 0 12px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pomodoro Engine</p>
            <div className="pomodoro-circle">
              <div className="pomodoro-inner">
                <div className="pomodoro-time">25:00</div>
                <div className="pomodoro-label">READY</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '16px', marginBottom: '8px' }}>Join or create a room to start a synchronized focus session</p>
            <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
              Sessions: <span style={{ color: 'white', fontWeight: 700 }}>{profile?.total_sessions || 0}</span> • Streak: <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{profile?.streak_days || 0} days</span>
            </div>
          </div>
        </div>

        {/* Lofi Card — Premium teaser */}
        <div className="bento-card bento-lofi" style={{ position: 'relative' }}>
          <div className="bento-header" style={{ marginBottom: '16px' }}>
            <h2 className="bento-title"><span className="bento-icon">♫</span> Ambient Sound Mixer</h2>
            <span className="dashboard-badge" style={{ fontSize: '9px' }}>PRO</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', opacity: 0.4 }}>
            <div style={{ fontSize: '48px' }}>🎧</div>
            <p style={{ fontSize: '13px', color: 'var(--text-gray)', textAlign: 'center', maxWidth: '280px' }}>
              Mix Rain, Café, and Fireplace ambiance with curated Lofi radio. <br />
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Coming with Sessions Pro.</span>
            </p>
          </div>
        </div>

        {/* Chat Card */}
        <div className="bento-card bento-chat">
          <div className="bento-header" style={{ marginBottom: '12px' }}>
            <h2 className="bento-title"><span className="bento-icon">💬</span> Global Stream</h2>
          </div>
          <div className="chat-stream">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-gray)', padding: '20px 0', fontSize: '12px' }}>No messages yet. Say hello!</div>
            ) : messages.map(msg => (
              <div key={msg.id} className="chat-message">
                <span className="chat-user">{msg.profiles?.display_name || 'Anon'}:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{msg.content}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
            <input type="text" placeholder="Say something..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }} />
            <button onClick={handleSendMessage} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '0 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>SEND</button>
          </div>
          {chatError && <div style={{ color: '#FCA5A5', fontSize: '11px', marginTop: '6px' }}>{chatError}</div>}
        </div>

        {/* Tasks Card */}
        <div className="bento-card bento-todos">
          <div className="bento-header" style={{ marginBottom: '8px' }}>
            <h2 className="bento-title"><span className="bento-icon">✓</span> My Tasks</h2>
          </div>
          <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input type="text" placeholder="Add task..." value={newTodo} onChange={e => setNewTodo(e.target.value)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none' }} />
            <button type="submit" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0 10px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>+</button>
          </form>
          <div className="todo-list">
            {tasks.map(todo => (
              <label key={todo.id} className={`todo-item ${todo.completed ? 'todo-item-completed' : ''}`}>
                <input type="checkbox" checked={todo.completed} onChange={() => handleToggleTodo(todo.id, todo.completed)} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.text}</span>
                <button onClick={(e) => { e.preventDefault(); handleDeleteTodo(todo.id); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>×</button>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: 'var(--text-gray)' }}>
            Personal tasks persist across sessions
          </div>
        </div>
      </section>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '460px', backdropFilter: 'blur(30px)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>✦ Create Study Room</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Room Title</label>
                <input type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} placeholder="e.g. Deep Work: Algorithms & Data Structures" className="auth-input" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Category</label>
                <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className="auth-input" style={{ cursor: 'pointer' }}>
                  {["General", "Computer Science", "Medicine", "Engineering", "Law", "Chemistry", "Physics", "Mathematics", "Languages", "Business", "Art & Design"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Visibility</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['public', 'private'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setCreateForm({ ...createForm, visibility: v })} style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', background: createForm.visibility === v ? (v === 'public' ? 'rgba(16,185,129,0.2)' : 'rgba(255,80,0,0.2)') : 'rgba(255,255,255,0.05)', border: createForm.visibility === v ? (v === 'public' ? '1px solid #10B981' : '1px solid var(--orange)') : '1px solid rgba(255,255,255,0.1)', color: createForm.visibility === v ? 'white' : 'var(--text-gray)' }}>
                      {v === 'public' ? '🌐 Public' : '🔒 Private'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Focus (min)</label>
                  <select value={(createForm.focus_duration || 1500) / 60} onChange={e => setCreateForm({ ...createForm, focus_duration: Number(e.target.value) * 60 })} className="auth-input" style={{ cursor: 'pointer' }}>
                    {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Break (min)</label>
                  <select value={(createForm.break_duration || 300) / 60} onChange={e => setCreateForm({ ...createForm, break_duration: Number(e.target.value) * 60 })} className="auth-input" style={{ cursor: 'pointer' }}>
                    {[3, 5, 10, 15].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Long Break (min)</label>
                  <select value={(createForm.long_break_duration || 900) / 60} onChange={e => setCreateForm({ ...createForm, long_break_duration: Number(e.target.value) * 60 })} className="auth-input" style={{ cursor: 'pointer' }}>
                    {[10, 15, 20, 30].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Long Break Every</label>
                  <select value={createForm.long_break_interval || 4} onChange={e => setCreateForm({ ...createForm, long_break_interval: Number(e.target.value) })} className="auth-input" style={{ cursor: 'pointer' }}>
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} cycles</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleCreateRoom} style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
                CREATE & ENTER ROOM
              </button>
              {createError && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '10px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>{createError}</div>}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
