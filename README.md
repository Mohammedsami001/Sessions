<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png" alt="Sessions Study OS Icon" width="130" />

  # ✦ SESSIONS ✦
  
  **The Premium Real-Time Multiplayer Study OS**  
  *Engineered for pure student focus. Powered by Next.js App Router, Supabase Client Infrastructure, and Custom Glassmorphic Ambient Visual Systems.*
  
  <br />

  [![Next.js 16](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase Auth](https://img.shields.io/badge/Supabase_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vercel Deployment](https://img.shields.io/badge/Vercel_Edge-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

  <p align="center">
    <a href="#-architectural-vision">Vision</a> •
    <a href="#-core-modules--bento-workspace">Features</a> •
    <a href="#-production-deployment-guide">Deployment</a> •
    <a href="#-environment-configuration">Configuration</a> •
    <a href="#-development-roadmap">Roadmap</a>
  </p>
</div>

---

## 🎬 Architectural Vision

**Sessions** reimagines traditional digital timers into an immersive, premium workspace environment. Inspired by the **Resend Launch Week 6** retro-cinema design language, the interface incorporates deep electric blue backgrounds (`#0651E3`), dynamic cinematic grain overlays, subtle dark vignettes, and high-fidelity layered glassmorphism (`backdrop-filter`). 

Designed specifically as a scalable multi-tenant SaaS application, it establishes a reliable zero-lag single-page authentication lifecycle paired directly with modular focus applications.

---

## 🍱 Core Modules & Bento Workspace

Upon authentication, users gain full access to the modular **Study OS Workspace**, structurally arranged via a highly optimized, fully responsive **Bento Grid**:

### 🌐 1. Public Discovery Lobby
- Live metrics listing multi-user shared study rooms categorized by academic discipline.
- Real-time peer counters paired with responsive connectivity node feedback indicators.

### ⏱ 2. Synchronous Pomodoro Engine
- Highly visible custom timer components simulating global synchronous cycles.
- Dedicated state controllers toggling seamlessly between **Focus Cycles** (`25:00`) and **Short Rest Intervals** (`05:00`).

### 🎧 3. Lofi & Ambient Sound Deck
- Embedded audio mixing sliders enabling custom multi-layered soundscape generation.
- Simultaneous mixing controls for **Soft Rain**, **Café Ambiance**, and **Crackling Fire** audio channels paired directly with curated study lofi radio streams.

### 💬 4. Global Discovery Stream
- Real-time mock telemetry messaging feed connecting active peer groups.
- Custom gold typography sender badges with auto-scrolling line outputs.

### ✓ 5. Ephemeral Session Checklist
- Integrated micro-task manager enabling inline checklist updates designed to refresh dynamically upon cycle conclusions.

---

## 🔒 Multi-Provider OAuth Infrastructure

Sessions provides lightning-fast user onboarding optimized for static web exports and edge caching architectures using implicit grant access payloads:
- **Zero-Friction Authentication**: High-fidelity custom forms supporting professional **GitHub** and **Google** Single Sign-On (SSO) triggers alongside secure standard password strategies.
- **Client Hash Resolution**: Access parameters are ingested programmatically on root path loading (`/dashboard#access_token=...`), bypassing intermediate server bottlenecks to prevent visual delays or `404` loading deadlocks.

---

## 🚀 Production Deployment Guide

Deploying your production instance live to **Vercel** requires configuring standard client-side tokens.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/sessions-study-os.git
cd sessions-study-os
npm install
```

### 2. Environment Variables Setup
Create a new file named `.env.local` in your root repository directory referencing your active Supabase infrastructure parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-client-anon-key
```

### 3. Local Development Start
```bash
npm run dev
```
Access the application directly at `http://localhost:3000`.

---

## ⚙️ Production Supabase Configuration

To guarantee flawless redirection compatibility for third-party Single Sign-On configurations across remote cloud deployments:
1. Log into your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Configure your primary target web address inside the **Site URL** parameter:
   ```text
   https://your-custom-production-domain.vercel.app
   ```
3. Attach dynamic routing patterns to the **Redirect URLs** list to authorize internal paths:
   ```text
   https://your-custom-production-domain.vercel.app/**
   ```

---

## 🗺 Development Roadmap

- [x] **Phase 1**: Core Next.js Setup, Premium UI Tokens Configuration, Singleton Client Authentication Hooks.
- [x] **Phase 2**: High-Fidelity Bento Grid Workspace Design, Ambient Sliders Integration, Direct Token Hash Consumer Mapping.
- [ ] **Phase 3**: Supabase Realtime Channels integration syncing shared WebSocket client room loops.
- [ ] **Phase 4**: Advanced SaaS Gamification Pipelines (Productivity Heatmaps, Neon Profile Cosmetics, Custom Tier Customization).

---

<div align="center">
  <br />
  <p><b>Sessions Study OS</b> • Built to make online collaborative learning absolute, immersive, and striking.</p>
</div>
