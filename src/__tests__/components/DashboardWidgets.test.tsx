import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ActiveRoomsWidget from "@/components/ui/active-rooms-widget";
import GlobalChatWidget from "@/components/ui/global-chat-widget";
import StudyChecklistWidget from "@/components/ui/study-checklist-widget";

describe("Dashboard Widgets", () => {
  it("renders ActiveRoomsWidget correctly", () => {
    const mockRooms = [{ id: "1", title: "Study Group", category: "math", visibility: "public", timer_started_at: null, timer_status: "idle", focus_duration: 25, break_duration: 5, long_break_duration: 15 }];
    render(<ActiveRoomsWidget rooms={mockRooms} participantCounts={{ "1": 5 }} handleQuickJoin={vi.fn()} setShowCreateModal={vi.fn()} />);
    expect(screen.getByText(/Active Rooms/i)).toBeInTheDocument();
    expect(screen.getByText("Study Group")).toBeInTheDocument();
  });

  it("renders GlobalChatWidget correctly", () => {
    render(<GlobalChatWidget chatMessages={[]} chatInput="" setChatInput={vi.fn()} handleSendMessage={vi.fn()} chatEndRef={null} />);
    expect(screen.getByText(/Global Chat Stream/i)).toBeInTheDocument();
  });

  it("renders StudyChecklistWidget correctly", () => {
    render(<StudyChecklistWidget tasks={[]} newTaskTitle="" setNewTaskTitle={vi.fn()} handleAddTask={vi.fn()} toggleTaskCompletion={vi.fn()} deleteTask={vi.fn()} />);
    expect(screen.getByText(/Study Checklist/i)).toBeInTheDocument();
  });
});
