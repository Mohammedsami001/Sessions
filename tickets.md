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
