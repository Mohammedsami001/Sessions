# Ubiquitous Language

## Core Entities

| Term | Definition | Aliases to avoid |
| ----------- | ------------------------------------------------------- | --------------------- |
| **Room** | A temporary, multiplayer study workspace containing a synchronized timer and scoped chat. | Station, Classroom, Study Room |
| **Host** | The user who currently controls a Room's Timer (start/pause/reset). | Creator, Admin |
| **Participant** | Any authenticated user who is actively joined to a Room. | Peer, Member, Student |
| **Timer** | A server-authoritative, synchronized Pomodoro clock within a Room. | Clock, Stopwatch |
| **Sessions** | The overarching name of the application / Study OS. | Prisma, App |

## Navigation & Areas

| Term | Definition | Aliases to avoid |
| ----------- | ------------------------------------------------------- | --------------------- |
| **Dashboard** | The main authenticated area where a user views available Rooms and their Profile stats. | Lobby, Console, Home |
| **Profile** | The user's account details, focus history, and gamified experience points (XP). | Account Console, User Settings |

## Relationships

- A **Room** contains exactly one **Timer**.
- A **Room** has exactly one **Host** at any given time.
- A **Room** can have multiple **Participants**.
- A **Host** is also a **Participant**.
- A user can only be a **Participant** in one **Room** at a time.

## Example dialogue

> **Dev:** "If the **Host** disconnects, does the **Room** get archived immediately?"
> **Domain expert:** "No, ownership of the **Room** automatically transfers to the longest-tenured **Participant** so the **Timer** isn't interrupted."
> **Dev:** "What if the last **Participant** leaves the **Station**?"
> **Domain expert:** "We call it a **Room**, not a Station. And yes, when the last **Participant** leaves, the **Room** is archived."
> **Dev:** "Got it. Can a user view the **Dashboard** while they are a **Participant** in a **Room**?"
> **Domain expert:** "Yes, navigating to the **Dashboard** does not disconnect them from the **Room**."

## Flagged ambiguities

- **Room vs Station vs Classroom**: The UI previously referenced "ENTER STATION" and "synchronized classrooms", but the domain logic and `CONTEXT.md` clearly define this entity as a **Room**. Recommend strictly using **Room** across the UI and documentation.
- **Dashboard vs Lobby vs Account Console**: The UI has links saying "RETURN TO LOBBY" and "ACCOUNT CONSOLE", but they point to the `/dashboard` and `/profile` routes respectively. We should standardize on **Dashboard** and **Profile**.
- **Sessions vs Prisma**: You correctly replaced "Prisma" with "Sessions" in the hero component. "Prisma" was a placeholder from the UI library; **Sessions** is the canonical name of the app.
