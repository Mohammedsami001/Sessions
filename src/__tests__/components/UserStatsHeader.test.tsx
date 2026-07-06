import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UserStatsHeader from "@/components/ui/user-stats-header";

describe("UserStatsHeader Component", () => {
  const mockProfile = {
    id: "123",
    display_name: "MOSAMI",
    email: "test@example.com",
    exp: 250,
    total_focus_seconds: 90000, // 25 hours
    streak_days: 2,
    total_sessions: 10,
    created_at: new Date().toISOString()
  };

  const mockLevelInfo = {
    level: 5,
    currentExp: 250,
    nextLevelExp: 500,
    progress: 50
  };

  it("renders the user's name and online status", () => {
    render(<UserStatsHeader profile={mockProfile} levelInfo={mockLevelInfo} />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText("MOSAMI")).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE PROTOCOL/i)).toBeInTheDocument();
  });

  it("displays the correct stats without loud colors", () => {
    render(<UserStatsHeader profile={mockProfile} levelInfo={mockLevelInfo} />);
    
    // Check for level, exp, and focus text
    expect(screen.getByText("LEVEL")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Level 5
    
    expect(screen.getByText("EXPERIENCE")).toBeInTheDocument();
    expect(screen.getByText(/250 XP/i)).toBeInTheDocument();
    
    expect(screen.getByText("TOTAL FOCUS")).toBeInTheDocument();
  });
});
