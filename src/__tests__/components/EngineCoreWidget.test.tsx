import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import EngineCoreWidget from "@/components/ui/engine-core-widget";

describe("EngineCoreWidget Component", () => {
  const mockProfile = {
    id: "123",
    total_sessions: 15,
    streak_days: 3
  };

  it("renders the timer interface", () => {
    render(<EngineCoreWidget profile={mockProfile as any} />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByText(/READY STATE/i)).toBeInTheDocument();
  });

  it("renders the correct stats", () => {
    render(<EngineCoreWidget profile={mockProfile as any} />);
    
    // Sessions
    expect(screen.getByText(/sessions/i)).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    
    // Streak
    expect(screen.getByText(/focus streak/i)).toBeInTheDocument();
    expect(screen.getByText(/3 Days/i)).toBeInTheDocument();
  });
});
