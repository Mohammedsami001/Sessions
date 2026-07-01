# Codebase Review Report

## Standards
*Does the codebase conform to this repo's documented coding standards?*

- **Hard Violation (`UBIQUITOUS_LANGUAGE.md` - Core Entities):** In `src/app/dashboard/page.tsx`, the UI uses the term "Station" multiple times (e.g., "ENTER STATION" button, "Host custom station", "CREATE & ENTER STATION"). The ubiquitous language documentation strictly mandates using "Room" instead of "Station" or "Classroom".
- **Hard Violation (`UBIQUITOUS_LANGUAGE.md` - Flagged ambiguities):** The `<PrismaHero>` component name and test files still contain "Prisma" in their filenames and code references (e.g., `src/components/ui/prisma-hero.tsx` and `src/__tests__/components/PrismaHero.test.tsx`). The documentation states that "Sessions is the canonical name of the app", and "Prisma" should be purged.
- **Judgement Call (`AGENTS.md`):** The repository is using Next.js App Router conventions (e.g., `page.tsx`, `layout.tsx`). The use of `"use client"` in `dashboard/page.tsx` is fine, but handling raw Supabase auth state and fetching data via `useEffect` client-side instead of using React Server Components diverges from modern Next.js 14/15 best practices as documented in the Next.js standard guides. 

## Spec
*Does the codebase faithfully implement the documented domain context?*

- **Missing requirement (`CONTEXT.md` - Timer Sync Model):** The documentation specifies that "Timer state changes (start, pause, reset, mode transition) are the only events broadcast via Realtime". Currently, the implementation of `SupabaseRoomRepository` is fetching and broadcasting more than just the timer state (e.g., it subscribes to entire table row changes).
- **Scope creep / Implementation Error (`CONTEXT.md` - Account Deletion):** The `deleteAccount` logic in `ProfileService.ts` implies the client handles this, but the `CONTEXT.md` specifically notes: "Requires a server-side function (Supabase Edge Function or Next.js API route with service_role key) since client-side anon key cannot delete auth records." It looks like this might fail if a user actually tries to trigger it strictly from the client.
- **Implemented correctly:** The "Host transfer" and "Ephemeral rooms" logic detailed in `CONTEXT.md` correctly maps to the backend functions (like `supabase-host-delete-participants.sql`). 

***

**Summary:** 
- **Standards:** 3 findings (Worst issue: Residual "Station" nomenclature leaking into the Dashboard UI despite explicit deprecation).
- **Spec:** 2 findings (Worst issue: Potential failure in account deletion due to missing secure server-side execution path).
