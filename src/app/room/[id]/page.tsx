"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
  fetchRoom,
  fetchParticipants,
  leaveRoom,
  deleteRoom,
  startTimer,
  pauseTimer,
  resetTimer,
  completeTimerCycle,
  switchTimerMode,
  subscribeToRoom,
  subscribeToParticipants,
} from "../../../lib/rooms";
import {
  fetchRecentMessages,
  sendMessage,
  subscribeToMessages,
} from "../../../lib/chat";
import {
  fetchTasks,
  createTask,
  toggleTask,
  deleteTask,
} from "../../../lib/tasks";
import type { Room, Task, MessageWithProfile } from "../../../lib/types";
import { computeTimerRemaining } from "../../../lib/types";

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
  const [newTodo, setNewTodo] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [timerDisplay, setTimerDisplay] = useState({
    minutes: 25,
    seconds: 0,
    totalRemaining: 1500,
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isHost = room?.host_id === currentUserId;

  const loadParticipants = useCallback(async () => {
    if (!roomId) return;
    const p = await fetchParticipants(roomId);
    setParticipants(p);
  }, [roomId]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    const m = await fetchRecentMessages(roomId, 100);
    setMessages(m);
  }, [roomId]);

  const loadTasks = useCallback(async () => {
    const g = await fetchTasks(null);
    setGlobalTasks(g);
    if (roomId) {
      const r = await fetchTasks(roomId);
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
      if (session?.user?.id) setCurrentUserId(session.user.id);
      const r = await fetchRoom(roomId);
      if (r) {
        setRoom(r);
        updateTimerDisplay(r);
      }
      setLoading(false);
      await Promise.all([loadParticipants(), loadMessages(), loadTasks()]);
    }
    init();

    const roomSub = subscribeToRoom(roomId, (updated) => {
      setRoom(updated);
      updateTimerDisplay(updated);
    });
    const partSub = subscribeToParticipants(roomId, () => loadParticipants());
    const chatSub = subscribeToMessages(roomId, () => loadMessages());

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
      supabase.removeChannel(roomSub);
      supabase.removeChannel(partSub);
      supabase.removeChannel(chatSub);
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
            completeTimerCycle(roomId, isLongBreak ? "long_break" : "break");
          } else {
            startTimer(roomId, "focus");
          }
        }
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room, roomId, isHost]);

  const handleLeave = async () => {
    await leaveRoom(roomId);
    window.location.href = "/dashboard";
  };
  const handleDelete = async () => {
    const ok = await deleteRoom(roomId);
    if (ok) window.location.href = "/dashboard";
    setShowDeleteConfirm(false);
  };
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    await sendMessage(chatInput, roomId);
    setChatInput("");
    await loadMessages();
  };
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await createTask(newTodo, taskTab === "room" ? roomId : null);
    setNewTodo("");
    await loadTasks();
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

  if (loading)
    return (
      <main className="dashboard-wrapper">
        <p
          style={{
            textAlign: "center",
            color: "var(--text-gray)",
            marginTop: "100px",
          }}
        >
          Joining room...
        </p>
      </main>
    );
  if (!room)
    return (
      <main className="dashboard-wrapper">
        <p
          style={{
            textAlign: "center",
            color: "var(--text-gray)",
            marginTop: "100px",
          }}
        >
          Room not found.{" "}
          <Link href="/dashboard" style={{ color: "var(--gold)" }}>
            Return to Dashboard
          </Link>
        </p>
      </main>
    );

  return (
    <main className="dashboard-wrapper">
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            textDecoration: "none",
            color: "var(--text-gray)",
            fontSize: "13px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ← <span style={{ color: "white" }}>Dashboard</span>
        </Link>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {room.join_code && (
            <span
              style={{
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.3)",
                color: "var(--gold)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.15em",
              }}
            >
              CODE: {room.join_code}
            </span>
          )}
          {isHost && (
            <span
              style={{
                background: "rgba(255,80,0,0.2)",
                border: "1px solid var(--orange)",
                color: "var(--orange)",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              HOST
            </span>
          )}
          <button
            onClick={handleLeave}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "var(--text-gray)",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Leave Room
          </button>
          {isHost && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#FCA5A5",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Delete Room
            </button>
          )}
        </div>
      </div>

      <header className="dashboard-header">
        <div>
          <span
            style={{
              fontSize: "11px",
              color: "var(--gold)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {room.category}
          </span>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "4px 0 0" }}>
            {room.title}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-gray)",
            }}
          >
            <span className="online-dot"></span> {participants.length} peers
          </span>
        </div>
      </header>

      <section className="bento-grid">
        {/* Timer */}
        <div className="bento-card bento-pomodoro">
          <div style={{ width: "100%", textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              {(["focus", "break", "long_break"] as const).map((mode) => {
                const isActive = room.timer_status === mode;
                const isPaused = room.timer_status === "idle";
                const isClickable = isHost && isPaused;

                return (
                  <button
                    key={mode}
                    onClick={() => isClickable && switchTimerMode(roomId, mode)}
                    disabled={!isClickable}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: isActive
                        ? mode === "focus"
                          ? "rgba(255,80,0,0.2)"
                          : "rgba(59,130,246,0.2)"
                        : "transparent",
                      border: isActive
                        ? `1px solid ${mode === "focus" ? "var(--orange)" : "#3B82F6"}`
                        : `1px solid ${isClickable ? "rgba(255,255,255,0.2)" : "transparent"}`,
                      color: isActive
                        ? mode === "focus"
                          ? "var(--orange)"
                          : "#3B82F6"
                        : "var(--text-gray)",
                      cursor: isClickable ? "pointer" : "default",
                      transition: "all 0.2s",
                      opacity: isClickable ? 1 : 0.6,
                    }}
                    title={
                      isClickable
                        ? `Switch to ${mode.replace("_", " ")}`
                        : "Start or pause the timer to switch modes"
                    }
                  >
                    {mode.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            </div>
            <div
              className="pomodoro-circle"
              style={{
                background: `conic-gradient(${timerColor} 0% ${conicProgress}%, rgba(255,255,255,0.05) ${conicProgress}% 100%)`,
              }}
            >
              <div className="pomodoro-inner">
                <div className="pomodoro-time">
                  {String(timerDisplay.minutes).padStart(2, "0")}:
                  {String(timerDisplay.seconds).padStart(2, "0")}
                </div>
                <div className="pomodoro-label" style={{ color: timerColor }}>
                  {room.timer_status === "idle"
                    ? "READY"
                    : room.timer_status.replace("_", " ").toUpperCase()}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-gray)",
                margin: "8px 0",
              }}
            >
              Cycle {room.cycles_completed} / {room.long_break_interval}
            </div>
            {isHost && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                {room.timer_status === "idle" ? (
                  <button
                    onClick={() => startTimer(roomId, "focus")}
                    style={{
                      background: "var(--gold)",
                      color: "black",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    START FOCUS
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => pauseTimer(roomId)}
                      style={{
                        background: "white",
                        color: "black",
                        border: "none",
                        padding: "10px 24px",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      PAUSE
                    </button>
                    <button
                      onClick={() => resetTimer(roomId)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text-gray)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      RESET
                    </button>
                  </>
                )}
              </div>
            )}
            {!isHost && (
              <p
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: "12px",
                }}
              >
                Timer and mode switching controlled by room host
              </p>
            )}
          </div>
        </div>

        {/* Participants */}
        <div
          className="bento-card"
          style={{ gridColumn: "span 8", minHeight: "120px" }}
        >
          <div className="bento-header">
            <h2 className="bento-title">
              <span className="bento-icon">👥</span> Participants
            </h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {participants.map((p: any) => (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <span className="online-dot"></span>
                <span
                  style={{
                    fontWeight: 600,
                    color: p.user_id === room.host_id ? "var(--gold)" : "white",
                  }}
                >
                  {p.profiles?.display_name || "Student"}
                </span>
                {p.user_id === room.host_id && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--orange)",
                      fontWeight: 700,
                    }}
                  >
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Room Chat */}
        <div
          className="bento-card"
          style={{ gridColumn: "span 7", minHeight: "320px" }}
        >
          <div className="bento-header" style={{ marginBottom: "12px" }}>
            <h2 className="bento-title">
              <span className="bento-icon">💬</span> Room Chat
            </h2>
          </div>
          <div className="chat-stream" style={{ maxHeight: "220px" }}>
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-gray)",
                  padding: "20px 0",
                  fontSize: "12px",
                }}
              >
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="chat-message">
                  <span className="chat-user">
                    {msg.profiles?.display_name || "Anon"}:
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    {msg.content}
                  </span>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
            <input
              type="text"
              placeholder="Message this room..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "var(--gold)",
                color: "black",
                border: "none",
                padding: "0 12px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              SEND
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div
          className="bento-card"
          style={{ gridColumn: "span 5", minHeight: "320px" }}
        >
          <div className="bento-header" style={{ marginBottom: "8px" }}>
            <h2 className="bento-title">
              <span className="bento-icon">✓</span> Tasks
            </h2>
          </div>
          <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
            {(["room", "global"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTaskTab(tab)}
                style={{
                  flex: 1,
                  padding: "6px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  background:
                    taskTab === tab
                      ? "rgba(255,215,0,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    taskTab === tab
                      ? "1px solid rgba(255,215,0,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                  color: taskTab === tab ? "var(--gold)" : "var(--text-gray)",
                }}
              >
                {tab === "room" ? "Room Tasks" : "My Tasks"}
              </button>
            ))}
          </div>
          <form
            onSubmit={handleAddTask}
            style={{ display: "flex", gap: "6px", marginBottom: "8px" }}
          >
            <input
              type="text"
              placeholder={`Add ${taskTab} task...`}
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "6px 10px",
                borderRadius: "6px",
                color: "white",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                padding: "0 10px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </form>
          <div className="todo-list">
            {(taskTab === "room" ? roomTasks : globalTasks).map((t) => (
              <label
                key={t.id}
                className={`todo-item ${t.completed ? "todo-item-completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() =>
                    toggleTask(t.id, !t.completed).then(() => loadTasks())
                  }
                />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.text}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    deleteTask(t.id).then(() => loadTasks());
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "0 4px",
                  }}
                >
                  ×
                </button>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "rgba(10,15,30,0.95)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "20px",
              padding: "32px",
              width: "100%",
              maxWidth: "420px",
              backdropFilter: "blur(30px)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
                color: "#FCA5A5",
              }}
            >
              Delete This Room?
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-gray)",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              This will{" "}
              <strong style={{ color: "white" }}>permanently delete</strong> the
              room and{" "}
              <strong style={{ color: "white" }}>
                remove all participants
              </strong>
              . Everyone currently in this room will be sent back to the
              dashboard.
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--text-gray)",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background: "#EF4444",
                  border: "none",
                  color: "white",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
