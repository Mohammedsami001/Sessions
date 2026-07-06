import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import JoinRoomBar from "@/components/ui/join-room-bar";

describe("JoinRoomBar Component", () => {
  it("renders the input and join button", () => {
    const setJoinCode = vi.fn();
    const handleJoinByCode = vi.fn();

    render(
      <JoinRoomBar 
        joinCode="" 
        setJoinCode={setJoinCode} 
        handleJoinByCode={handleJoinByCode} 
        joinError="" 
      />
    );
    
    expect(screen.getByPlaceholderText(/ENTER ROOM JOIN CODE/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /JOIN SESSION/i })).toBeInTheDocument();
  });

  it("calls handleJoinByCode on button click", () => {
    const setJoinCode = vi.fn();
    const handleJoinByCode = vi.fn();

    render(
      <JoinRoomBar 
        joinCode="TEST" 
        setJoinCode={setJoinCode} 
        handleJoinByCode={handleJoinByCode} 
        joinError="" 
      />
    );
    
    fireEvent.click(screen.getByRole("button", { name: /JOIN SESSION/i }));
    expect(handleJoinByCode).toHaveBeenCalled();
  });
});
