import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatCardsWidget from "@/components/ui/stat-cards-widget";

describe("StatCardsWidget Component", () => {
  const mockProfile = {
    exp: 200,
    total_focus_seconds: 90000 // 25 hours
  };

  const mockLevelInfo = {
    level: 11
  };

  it("displays the correct Level, Focus, and XP stats", () => {
    render(<StatCardsWidget profile={mockProfile} levelInfo={mockLevelInfo} />);
    
    expect(screen.getByText("Level")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("Protocol Level")).toBeInTheDocument();
    
    expect(screen.getByText("Total Focus")).toBeInTheDocument();
    expect(screen.getByText("25h 0m")).toBeInTheDocument();
    expect(screen.getByText("This Session")).toBeInTheDocument();
    
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("200 XP")).toBeInTheDocument();
    expect(screen.getByText("Total Earned")).toBeInTheDocument();
  });
});
