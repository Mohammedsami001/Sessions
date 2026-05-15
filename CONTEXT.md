# Sessions — Domain Context

## Glossary

### Room
A temporary, multiplayer study workspace. Created by a **Host**, joinable by any authenticated **Participant**. Contains a synchronized **Timer**, a scoped **Chat**, and access to **Room Tasks**. Rooms are ephemeral — they exist while at least one participant is present. When the last participant leaves, the room is archived.

### Host
The user who currently controls a Room's Timer. Initially the Room's creator. If the Host disconnects, ownership transfers automatically to the longest-tenured remaining Participant. The Host can start, pause, and reset the Timer, and configure interval durations at creation time.

### Participant
Any authenticated user who has joined a Room. Tracked via the `room_participants` join table. A user can only be a Participant in one Room at a time.

### Timer (Server-Authoritative)
The synchronized Pomodoro clock inside a Room. State is stored as a timestamp anchor (`timer_started_at`) and duration config — not as a ticking counter. Clients compute remaining time locally from the anchor. Timer state changes (start, pause, reset, mode transition) are the only events broadcast via Realtime.

### Timer Status
One of: `idle`, `focus`, `break`, `long_break`. Transitions are written to the `rooms` row by the Host. A Postgres trigger increments `cycles_completed` and credits EXP/stats to all Participants when a `focus` block completes.

### Focus Duration / Break Duration / Long Break Duration / Long Break Interval
Host-configurable intervals set at Room creation. `long_break_interval` defines how many completed focus cycles trigger a Long Break (default: 4).

### Visibility
A Room is either `public` (listed in the Discovery Lobby) or `private` (hidden, joinable only via a **Join Code**).

### Join Code
A short, human-readable alphanumeric string (6-8 chars) generated for private Rooms. Used to join a Room without a direct URL. Displayed to the Host for sharing.

### Profile
A 1:1 extension of `auth.users`. Stores display identity (`display_name`, `avatar_url`), accumulated stats (`total_focus_seconds`, `exp`, `total_sessions`, `streak_days`), and tier status (`is_pro`). Auto-created by a database trigger on signup. Editable by the owning user.

### EXP (Experience Points)
An integer accumulator on the Profile. Credited automatically when a focus block completes. Amount scales with focus duration. Drives the **Level** system.

### Level
A client-derived integer computed from a user's `exp` using an escalating threshold curve. Never stored in the database. Used for display badges like "LEVEL 7 PROTOCOL."

### Global Task
A persistent to-do item tied to a user's Profile (`room_id = NULL`). Survives across rooms and sessions. Visible on the Dashboard and accessible inside any Room.

### Room Task
An ephemeral to-do item scoped to a specific Room (`room_id` set). Cleared when the Room is archived. Created within a Room session.

### Global Chat (Discovery Stream)
Messages with `room_id = NULL`. Visible to all authenticated users on the Dashboard lobby. A social/discovery channel.

### Room Chat
Messages with a `room_id` pointing to a specific Room. Visible only to that Room's Participants. The focused communication channel during study sessions.

## Architectural Decisions

### Timer Sync Model
Server-authoritative timestamp anchor. Clients compute remaining seconds from `timer_started_at` + configured duration. No per-second database writes. Timer state changes broadcast via Supabase Realtime on the `rooms` table.

### Room Lifecycle
Ephemeral with ownership transfer. Rooms die when empty. Host role auto-transfers to the oldest remaining participant on disconnect (via Supabase Realtime Presence).

### Audio Strategy (MVP)
Self-hosted `.mp3` loops in `/public` for free-tier lofi playback. Ambient sound mixer (Rain, Café, Fire) is gated behind Pro tier. External embeds deferred to a future phase.

### Account Deletion
Requires a server-side function (Supabase Edge Function or Next.js API route with `service_role` key) since client-side `anon` key cannot delete auth records. Cascades: profile, tasks, messages anonymized, auth record removed.

### Realtime Scope
Enabled on 3 tables only: `rooms`, `room_participants`, `messages`. All other tables use standard REST queries. Keeps Realtime connections lean.
