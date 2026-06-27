# Deep Modules & Ports and Adapters Refactoring

## Overview
This document details the architectural refactoring performed to transition the `Sessions` application from shallow, UI-coupled modules to **Deep Modules** using the **Ports and Adapters (Hexagonal)** architecture. 

The goal of this refactoring was to decouple database and backend logic from the React components, making the codebase highly testable, maintainable, and aligned with Test-Driven Development (TDD) principles.

## The Problem (Before)
Previously, the application relied on "shallow modules" (`src/lib/profile.ts`, `src/lib/tasks.ts`, `src/lib/chat.ts`, `src/lib/rooms.ts`). 
- **High Coupling:** React components directly imported these files, which in turn directly invoked the Supabase client.
- **Low Testability:** Without a way to easily mock the database layer, writing unit tests for core business logic (like focus timers, experience point calculation, or host transfers) was difficult.
- **Scattered Logic:** Business logic was often mixed inside UI event handlers (e.g., inside `page.tsx`).

## The Solution (After)
We introduced the **Ports and Adapters** architecture to create deep, independent modules:

### 1. Ports (Interfaces)
We defined clear TypeScript interfaces (Ports) in `src/lib/ports.ts` that dictate what the storage layer must do, without caring *how* it does it.
- `IProfileRepository`
- `ITaskRepository`
- `IChatRepository`
- `IRoomRepository`

### 2. Adapters
For each port, we created two adapters in `src/lib/adapters/`:
- **Supabase Adapters:** Production-ready adapters that interact with the real Supabase database.
- **In-Memory Adapters:** Lightweight, array/map-backed adapters used exclusively for lightning-fast unit testing.

### 3. Services (Core Domain Logic)
We created dedicated service classes in `src/lib/services/` that contain the actual business logic. These services depend strictly on the interfaces (Ports), not the implementations.
- `ProfileService`: Handles profile creation, fetching, and account deletion.
- `TaskService`: Handles task CRUD and completion toggles.
- `ChatService`: Manages real-time global and room-specific messaging subscriptions.
- `RoomService`: Manages complex room logic (creation, joining, timer updates, and host transfers).

### 4. Dependency Injection Container
We created a central registry in `src/lib/container.ts`. This file instantiates the Supabase adapters and injects them into the Services. The rest of the application imports the ready-to-use services from this container, ensuring the UI has zero knowledge of Supabase.

## Testing Strategy
Because of this architecture, we successfully adopted **Test-Driven Development (TDD)** using `vitest`.
All business logic is now tested using the In-Memory adapters, ensuring tests run in milliseconds without relying on an external database connection. Tests are located in `src/__tests__/services/`.

## Resolved Issues
This refactoring successfully closed the following project milestones:
1. Deepen Profile Module
2. Deepen Tasks Module
3. Deepen Chat Module
4. Deepen Room Module & Complex Timer Logic
5. Global Dependency Container & Cleanup

## Future Development
When adding new features in the future, follow this pattern:
1. **Define the Interface:** Add necessary methods to `src/lib/ports.ts`.
2. **Implement Adapters:** Write the Supabase and In-Memory implementations for the new methods.
3. **Write Tests First:** Write unit tests for the Service layer using the In-Memory adapter (TDD).
4. **Implement Service Logic:** Add the business logic to the Service.
5. **Connect the UI:** Call the Service method from your React components.
