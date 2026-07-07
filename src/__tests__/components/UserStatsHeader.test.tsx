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
    render(<UserStatsHeader profile={mockProfile} />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText("MOSAMI")).toBeInTheDocument();
    expect(screen.getByText(/ACTIVE PROTOCOL/i)).toBeInTheDocument();
  });

  it("displays the Profile and Sign Out buttons", () => {
    render(<UserStatsHeader profile={mockProfile} />);
    expect(screen.getByRole("button", { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument();
  });
});
