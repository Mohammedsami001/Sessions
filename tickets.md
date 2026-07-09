# Tickets: Dashboard UX Overhaul

This work executes the Dashboard UX Overhaul specification, reducing cognitive load and aligning the interface with the "Expert Confidence" brand register.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

## Remove Dashboard Clutter (Sound Deck & Emojis)

**What to build:** A cleaner, minimal dashboard view. The fake ambient sound widget and the emoji footer will be completely removed to ensure the dashboard feels serious and professional.

**Blocked by:** None — can start immediately

- [ ] Remove the "Ambient Sound Deck" UI container and its fake soundwave bars from the dashboard page.
- [ ] Remove the tiny footer containing emojis ("😊 Stay consistent...").
- [ ] Ensure the remaining bento grid layout still flows correctly without these elements.

## Implement Collapsible Sidebars for Chat & Rooms

**What to build:** The user can toggle the Global Chat and Active Rooms in and out of view. This declutters the main focus area and eliminates "Bento Grid" overload, allowing the user to focus exclusively on the timer and their tasks.

**Blocked by:** Remove Dashboard Clutter (Sound Deck & Emojis)

- [ ] Wrap the `GlobalChatWidget` in a collapsible sidebar component (e.g., sliding in from the right).
- [ ] Wrap the `ActiveRoomsWidget` in a collapsible sidebar component (e.g., sliding in from the left).
- [ ] Add prominent, accessible toggle buttons to the main view to open/close these sidebars.
- [ ] Ensure the central view (Timer and Task List) expands gracefully to fill the screen when sidebars are closed.

## Redesign "Host a Room" Modal

**What to build:** A streamlined, jargon-free room creation form named "Host a Room" that uses fast, selectable pill buttons instead of clunky native dropdown menus for setting focus and break durations.

**Blocked by:** None — can start immediately

- [ ] Rename the modal title from "Launch Shared Study Console" to "Host a Room".
- [ ] Replace the `<select>` inputs for Focus, Short Break, Long Break, and Interval with visually styled, selectable pill buttons (e.g., flex-row of buttons: [15m] [25m] [45m]).
- [ ] Update the `createForm` state accurately when these pill buttons are clicked.

## Add Global Keyboard Shortcuts for Timer

**What to build:** Power users can press `Spacebar` to instantly toggle the timer's play/pause state without using a mouse, maintaining their flow and efficiency.

**Blocked by:** None — can start immediately

- [ ] Add a global `keydown` event listener for the `Space` key within the dashboard or `EngineCoreWidget`.
- [ ] Ensure the shortcut toggles the timer state (Play/Pause).
- [ ] Ensure the shortcut is ignored if the user is currently typing inside an input field or textarea (e.g., chat input or new task input).
