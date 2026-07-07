import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ActiveRoomsWidget from "@/components/ui/active-rooms-widget";

describe("ActiveRoomsWidget Component", () => {
  it("renders the empty state correctly", () => {
    render(
      <ActiveRoomsWidget 
        rooms={[]} 
        participantCounts={{}} 
        handleQuickJoin={vi.fn()} 
        setShowCreateModal={vi.fn()} 
      />
    );
    
    expect(screen.getByText(/No active rooms right now./i)).toBeInTheDocument();
    expect(screen.getByText(/Be the pioneer and host a Room/i)).toBeInTheDocument();
    expect(screen.getByText(/Want to open a custom Room with friends\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Host custom room/i)).toBeInTheDocument();
  });
});
