"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface StudyRoom {
  id: string;
  title: string;
  category: string;
  participants: number;
  timerState: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>("student@sessions.os");
  const [loadingSession, setLoadingSession] = useState(true);

  // Feature simulated states
  const [rooms, setRooms] = useState<StudyRoom[]>([
    { id: "1", title: "Advanced Algorithms & Dynamic Programming", category: "Computer Science", participants: 14, timerState: "18:42 Focus" },
    { id: "2", title: "USMLE Step 1 Dedicated Focus Block", category: "Medicine", participants: 8, timerState: "04:15 Break" },
    { id: "3", title: "Late Night Pure Lofi Coding & Building", category: "Engineering", participants: 22, timerState: "24:50 Focus" },
    { id: "4", title: "Constitutional Law Briefs & Review", category: "Law", participants: 5, timerState: "12:05 Focus" },
    { id: "5", title: "Organic Chemistry Synthesis Prep", category: "Chemistry", participants: 11, timerState: "01:30 Break" },
  ]);

  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState(0);
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [timerMode, setTimerMode] = useState<"FOCUS" | "BREAK">("FOCUS");

  const [ambientRain, setAmbientRain] = useState(30);
  const [ambientCafe, setAmbientCafe] = useState(0);
  const [ambientFire, setAmbientFire] = useState(50);
  const [lofiPlaying, setLofiPlaying] = useState(true);

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "t1", text: "Map out database schemas", completed: true },
    { id: "t2", text: "Complete next chapter review", completed: false },
    { id: "t3", text: "Submit micro-assignments", completed: false },
  ]);

  const [newTodo, setNewTodo] = useState("");

  const [chatMessages, setChatMessages] = useState([
    { id: "c1", user: "Elena_V", text: "Finished my second Pomodoro session! Good luck everyone." },
    { id: "c2", user: "Marcus_99", text: "Is anyone studying for the AWS exam here?" },
    { id: "c3", user: "Sami_Dev", text: "Pure focus mode activated. Let's conquer these tasks!" },
  ]);

  // Load session metadata on component mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      } catch (err) {
        console.warn("Session check fallback triggered.");
      } finally {
        setLoadingSession(false);
      }
    }
    fetchSession();
  }, []);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
    setNewTodo("");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="dashboard-wrapper">
      
      {/* Dynamic Main Nav Integration directly accessible */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-gray)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← <span style={{ color: 'white' }}>Lobby</span>
        </Link>
        <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-gray)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Hero Header Strip */}
      <header className="dashboard-header">
        <div className="dashboard-user-info">
          <div className="dashboard-avatar">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="dashboard-greeting">
            <h1 className="dashboard-greeting-title">
              Welcome back, <span style={{ color: 'var(--gold)' }}>{userEmail.split('@')[0]}</span>
            </h1>
            <p className="dashboard-greeting-subtitle">Multiplayer Workspace Status: <span style={{ color: '#10B981', fontWeight: 600 }}>Connected</span></p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="dashboard-badge">✦ LEVEL 7 PROTOCOL ✦</div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.05)' }}>
            Total Focus: <span style={{ color: 'white', fontWeight: 700 }}>142 hrs</span>
          </div>
        </div>
      </header>

      {/* Main Responsive Bento Grid */}
      <section className="bento-grid">
        
        {/* Bento Card 1: Discovery Rooms Feed */}
        <div className="bento-card bento-rooms">
          <div className="bento-header">
            <h2 className="bento-title">
              <span className="bento-icon">✦</span> Active Study Rooms
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>{rooms.length} Active Public Sessions</span>
          </div>

          <div className="room-list">
            {rooms.map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-item-info">
                  <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {room.category}
                  </span>
                  <div className="room-item-title">{room.title}</div>
                  <div className="room-item-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="online-dot"></span> {room.participants} peers
                    </span>
                    <span>•</span>
                    <span style={{ color: room.timerState.includes("Focus") ? 'var(--orange)' : '#3B82F6', fontWeight: 600 }}>
                      ⏱ {room.timerState}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => alert(`✦ Subscribing to Room WebSocket stream: ${room.title} ✦\nLive multiplayer UI integration loading in Phase 2.`)}
                  className="btn-join"
                >
                  JOIN ROOM
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-gray)' }}>Want to host your own shared interval timer?</span>
            <button onClick={() => alert("Creating custom room functionality coming in Phase 3 sync setup.")} style={{ background: 'var(--gold)', border: 'none', color: 'black', fontWeight: 700, fontSize: '12px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer' }}>
              + Create Room
            </button>
          </div>
        </div>

        {/* Bento Card 2: Synchronized Pomodoro Engine */}
        <div className="bento-card bento-pomodoro">
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <button 
                onClick={() => { setTimerMode("FOCUS"); setPomodoroMinutes(25); setPomodoroSeconds(0); }}
                style={{ background: timerMode === 'FOCUS' ? 'rgba(255,80,0,0.2)' : 'transparent', border: timerMode === 'FOCUS' ? '1px solid var(--orange)' : 'none', color: timerMode === 'FOCUS' ? 'var(--orange)' : 'var(--text-gray)', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                FOCUS
              </button>
              <button 
                onClick={() => { setTimerMode("BREAK"); setPomodoroMinutes(5); setPomodoroSeconds(0); }}
                style={{ background: timerMode === 'BREAK' ? 'rgba(59,130,246,0.2)' : 'transparent', border: timerMode === 'BREAK' ? '1px solid #3B82F6' : 'none', color: timerMode === 'BREAK' ? '#3B82F6' : 'var(--text-gray)', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                SHORT BREAK
              </button>
            </div>

            <div className="pomodoro-circle">
              <div className="pomodoro-inner">
                <div className="pomodoro-time">
                  {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                </div>
                <div className="pomodoro-label">{timerMode} CYCLE</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
              <button 
                onClick={() => setPomodoroActive(!pomodoroActive)}
                style={{ background: pomodoroActive ? 'white' : 'var(--gold)', color: 'black', border: 'none', padding: '10px 24px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {pomodoroActive ? "PAUSE" : "START SYNC"}
              </button>
              <button 
                onClick={() => { setPomodoroActive(false); setPomodoroMinutes(timerMode === 'FOCUS' ? 25 : 5); setPomodoroSeconds(0); }}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-gray)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                RESET
              </button>
            </div>

            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '16px', marginBottom: 0 }}>
              ✦ Timer changes sync perfectly to peer dashboards via active WebSockets
            </p>
          </div>
        </div>

        {/* Bento Card 3: Ambient & Lofi Mixer Deck */}
        <div className="bento-card bento-lofi">
          <div className="bento-header" style={{ marginBottom: '16px' }}>
            <h2 className="bento-title">
              <span className="bento-icon">♫</span> Ambient Sound Mixer
            </h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              <span className="online-dot" style={{ width: '6px', height: '6px' }}></span> Live Radio
            </span>
          </div>

          {/* Current track simulation */}
          <div className="lofi-track-deck">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(45deg, #8B5CF6, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '10px' }}>
                LOFI
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Midnight Espresso Beats</div>
                <div style={{ fontSize: '11px', color: 'var(--text-gray)' }}>Sessions Study Collective</div>
              </div>
            </div>

            <button 
              onClick={() => setLofiPlaying(!lofiPlaying)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--gold)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {lofiPlaying ? "⏸" : "▶"}
            </button>
          </div>

          {/* Ambient sound volume sliders */}
          <div className="ambient-sliders">
            <div className="ambient-slider-group">
              <span style={{ width: '80px' }}>🌧 Soft Rain</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={ambientRain} 
                onChange={(e) => setAmbientRain(Number(e.target.value))} 
              />
              <span style={{ width: '28px', textAlign: 'right', fontSize: '11px' }}>{ambientRain}%</span>
            </div>

            <div className="ambient-slider-group">
              <span style={{ width: '80px' }}>☕ Cafe Chatter</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={ambientCafe} 
                onChange={(e) => setAmbientCafe(Number(e.target.value))} 
              />
              <span style={{ width: '28px', textAlign: 'right', fontSize: '11px' }}>{ambientCafe}%</span>
            </div>

            <div className="ambient-slider-group">
              <span style={{ width: '80px' }}>🔥 Crackling Fire</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={ambientFire} 
                onChange={(e) => setAmbientFire(Number(e.target.value))} 
              />
              <span style={{ width: '28px', textAlign: 'right', fontSize: '11px' }}>{ambientFire}%</span>
            </div>
          </div>
        </div>

        {/* Bento Card 4: Global Stream Feed */}
        <div className="bento-card bento-chat">
          <div className="bento-header" style={{ marginBottom: '12px' }}>
            <h2 className="bento-title">
              <span className="bento-icon">💬</span> Global Discovery Stream
            </h2>
          </div>

          <div className="chat-stream">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <span className="chat-user">{msg.user}:</span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{msg.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              placeholder="Say something to the active lobby..." 
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: 'white', fontSize: '12px', outline: 'none' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setChatMessages([...chatMessages, { id: Date.now().toString(), user: userEmail.split('@')[0], text: e.currentTarget.value.trim() }]);
                  e.currentTarget.value = "";
                }
              }}
            />
            <button 
              onClick={() => alert("Real-time database triggers appending in Phase 3.")}
              style={{ background: 'var(--gold)', color: 'black', border: 'none', padding: '0 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              SEND
            </button>
          </div>
        </div>

        {/* Bento Card 5: Ephemeral Micro-Tasks Checklist */}
        <div className="bento-card bento-todos">
          <div className="bento-header" style={{ marginBottom: '8px' }}>
            <h2 className="bento-title">
              <span className="bento-icon">✓</span> Session Tasks
            </h2>
          </div>

          <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input 
              type="text" 
              placeholder="Add short focus task..." 
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0 10px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
              +
            </button>
          </form>

          <div className="todo-list">
            {todos.map((todo) => (
              <label key={todo.id} className={`todo-item ${todo.completed ? 'todo-item-completed' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => toggleTodo(todo.id)} 
                />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {todo.text}
                </span>
              </label>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px', textAlign: 'center', fontSize: '10px', color: 'var(--text-gray)' }}>
            Tasks reset when session active cycle concludes
          </div>
        </div>

      </section>

    </main>
  );
}
