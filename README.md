<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png" alt="Sessions Study OS Icon" width="130" />

  # ✦ SESSIONS ✦
  
  **The Premium Real-Time Multiplayer Study OS**  
  *Synchronized focus rooms, live chat, gamified progression, and cinematic UI — built for students who take their craft seriously.*
  
  <br />

  [![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Realtime](https://img.shields.io/badge/Realtime-WebSockets-6C3FC5?style=for-the-badge&logo=socket.io&logoColor=white)](#)
  [![Vercel](https://img.shields.io/badge/Vercel_Edge-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <p align="center">
    <a href="#-architectural-vision">Vision</a> •
    <a href="#-live-study-rooms">Rooms</a> •
    <a href="#-gamification--progression">Progression</a> •
    <a href="#-tech-stack">Stack</a>
  </p>
</div>

---

## 🎬 Architectural Vision

**Sessions** reimagines online studying from a passive solo activity into an immersive, multiplayer experience. Inspired by the **Resend Launch Week 6** retro-cinema design language, the interface features deep electric blue canvases (`#0651E3`), cinematic grain overlays, and layered glassmorphism — creating a workspace that feels more like a premium product than a study tool.

Every interaction is real-time. Timers sync across continents. Chat messages appear instantly. Stats update the moment a focus block completes. Zero mock data, zero placeholders — everything you see is backed by a production database, Row Level Security policies, and server-authoritative state management.

---

## 🏠 Live Study Rooms

The heart of Sessions. Create or join multiplayer focus rooms where everyone studies together with a perfectly synchronized timer.

- **Public Discovery Lobby** — Browse active study rooms organized by academic discipline. See live participant counts and timer status in real-time.
- **Private Rooms with Join Codes** — Create invite-only rooms with auto-generated short codes (e.g., `ALGO7X`). Share the code with your study group — no link required.
- **Server-Authoritative Timer Sync** — Timers are stored as timestamp anchors, not ticking counters. Every client computes remaining time locally from the same source of truth. Zero per-second database writes. Infinitely scalable.
- **Automatic Host Transfer** — If the room creator disconnects, the oldest remaining participant becomes the new host. Rooms only close when empty.

---

## ⏱ Full Pomodoro Protocol

Not a stripped-down timer — the complete Pomodoro workflow with full cycle support.

- **Host-Configurable Intervals** — Set Focus (15–60 min), Short Break (3–15 min), and Long Break (10–30 min) durations at room creation.
- **Automatic Long Break Cycling** — After a configurable number of focus blocks (default: 4), the system automatically triggers a long break. Tracks `cycles_completed` per room.
- **Host Controls** — Start, pause, and reset. Timer state changes broadcast instantly to all room participants via Supabase Realtime.

---

## 💬 Dual-Scope Chat

Two chat layers working simultaneously — one for discovery, one for focused collaboration.

- **Global Discovery Stream** — A lobby-wide chat visible from the dashboard. Find study partners, share resources, or just say hello.
- **Room-Scoped Chat** — Private to each study room. Only participants can read and send messages. Powered by Realtime INSERT subscriptions with automatic refresh.

---

## ✓ Dual-Scope Task Management

Tasks that match how students actually work — some goals span weeks, others last one Pomodoro.

- **Global Tasks** — Persistent to-do items tied to your account. Visible on the dashboard and accessible inside any room. Survive across sessions.
- **Room Tasks** — Ephemeral micro-tasks scoped to a specific room. Cleared when the room closes. Perfect for 25-minute focus block objectives.
- **Full CRUD** — Create, toggle, and delete. All changes persist immediately to the database.

---

## 🏆 Gamification & Progression

An EXP-based leveling system that rewards consistency and makes studying feel like progress.

- **EXP System** — Earn experience points every time you complete a focus block. Longer sessions earn more EXP. Credited automatically via a server-side database trigger — tamper-proof.
- **Escalating Level Curve** — Level 1 requires 100 EXP. Level 5 requires 3,850. Level 10 requires 127,850. The curve roughly doubles per level, rewarding long-term commitment.
- **Lifetime Stats** — Total focus hours, total sessions completed, and consecutive day streaks tracked on your profile.
- **Editable Profiles** — Customize your display name. OAuth metadata (avatar, name) auto-populated on signup.

---

## 🔒 Security & Authentication

Production-grade access control with zero shortcuts.

- **Multi-Provider OAuth** — GitHub and Google Single Sign-On alongside standard email/password. Zero-friction onboarding.
- **Row Level Security** — Every table is protected by Postgres RLS policies. Users can only read what they're authorized to see and write what they own. Enforced at the database level, not the application layer.
- **Server-Side Account Deletion** — Full GDPR-ready account removal via a secure API route using the `service_role` key. Cascading cleanup across all tables.

---

## 🎧 Sessions Pro *(Coming Soon)*

Premium features for power users:

- **Ambient Sound Mixer** — Layer Rain, Café Chatter, and Crackling Fire audio with curated Lofi radio streams. Mix your perfect focus soundscape.
- **Productivity Heatmap** — GitHub-style contribution grid showing your most productive days.
- **Custom Cosmetics** — Neon username colors, animated profile borders, and custom room backgrounds.

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Vanilla CSS — Glassmorphism, Dark Mode, Cinematic Grain |
| **Auth & Database** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Real-Time** | Supabase Realtime (WebSocket channels on rooms, participants, messages) |
| **Server Logic** | Postgres Triggers (EXP crediting, profile auto-creation, join code generation) |
| **Hosting** | Vercel Edge Network |

---

<div align="center">
  <br />
  <p><b>Sessions</b> — Where focused students come to build, learn, and level up together.</p>
</div>
