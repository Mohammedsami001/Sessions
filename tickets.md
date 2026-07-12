# Tickets: Dashboard Rearchitecture 3-Column Cockpit

## Ticket 1: Structural Shell & Base Layout
**What to build:** The 3-column responsive grid layout in `page.tsx` with empty placeholders for Left, Center, and Right sidebars. The Engine Core timer is isolated into the center column.
**Blocked by:** None — can start immediately

## Ticket 2: Task State Schema & Mock Store Update
**What to build:** Updates the state layer and mocks the data providers for tasks to support `scope` (global/room), `dueDate`, `tags`, `priority`, and `subTasks`.
**Blocked by:** None — can start immediately

## Ticket 3: Left Column - Complex Task Tracker Widget
**What to build:** The fully interactive left sidebar where users can seamlessly toggle between global and room tasks, add sub-tasks, set priorities, and interact with their lists.
**Blocked by:** Ticket 1, Ticket 2

## Ticket 4: Right Column - Community Out-of-Room State
**What to build:** The right sidebar displaying the list of active public rooms and the explicit "Join Global Chat" portal button.
**Blocked by:** Ticket 1

## Ticket 5: Right Column - Community In-Room State & Leaderboard
**What to build:** The right sidebar variant for when a user is in a room. Shows the real-time room chat, visual member presence, and the localized leaderboard aggregating minutes focused and tasks completed.
**Blocked by:** Ticket 1

## Ticket 6: Global Chat Isolation Portal
**What to build:** The isolated view for Global Chat that is accessed via the portal button, ensuring global chatter doesn't bleed into the focused study dashboard.
**Blocked by:** Ticket 4

## Ticket 7: Engine Core & State Wiring
**What to build:** Final integration connecting the central timer to the new layout and ensuring state flows smoothly (e.g., finishing a focus block updates the room leaderboard).
**Blocked by:** Ticket 3, Ticket 4, Ticket 5, Ticket 6

# Tickets: Backend Readiness

## Ticket 8: Backend Task Schema Migration & RLS Update
**What to build:** Creates the SQL migration script `supabase-migration-tasks.sql` to add `scope`, `priority`, `dueDate`, `tags`, `subTasks` and fix the RLS visibility policy.
**Blocked by:** None — can start immediately

- [ ] Create `supabase-migration-tasks.sql`
- [ ] Add `scope`, `priority`, `dueDate`, `tags` (TEXT[]), `subTasks` (JSONB) to `tasks`
- [ ] Update RLS policy to allow room participants to view and update room tasks
- [ ] Instruct user to run it in Supabase SQL editor

## Ticket 9: Update Supabase Task Adapter for Complex Types
**What to build:** Updates `src/lib/adapters/supabase-task-repository.ts` to properly serialize and deserialize the new `tags` and `subTasks` arrays when communicating with Supabase.
**Blocked by:** Ticket 8

- [ ] Update `createTask` to pass `tags`, `subTasks`, `scope`, `priority`, `dueDate`
- [ ] Update `updateTask` for the new fields
- [ ] Ensure `fetchTasks` correctly handles the new JSONB fields

## Ticket 10: Fix Double-EXP Gamification Bug
**What to build:** Adjusts the timer-completion logic so that users only get gamification stats via the database trigger when in a room, and via client-side updates when in solo dashboard mode.
**Blocked by:** None — can start immediately

- [ ] Stop `EngineCoreWidget` from manually updating EXP if the user is in a room. Or better, rely on the DB trigger entirely for rooms. Since `EngineCoreWidget` only runs on the dashboard (solo), we might just need to verify the room page doesn't call it. Wait, `EngineCoreWidget` is on the dashboard. The room page uses its own timer logic. But if `EngineCoreWidget` is used on the dashboard, it calls `addFocusSession`. We need to ensure `addFocusSession` works correctly for solo sessions. Wait, what if the user starts a solo session, and `EngineCoreWidget` ends, it calls `addFocusSession`. That's correct. What if they are in a room? `room/[id]/page.tsx` does NOT render `EngineCoreWidget`, it has a separate timer. When the room timer ends, it triggers the DB trigger. So where is the double EXP coming from? Ah, maybe the user *thinks* they get double EXP because they had dashboard open in another tab? Or maybe we need to double check the trigger logic. We will investigate this in Ticket 10.
