import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import Sidebar from "@/components/ui/sidebar";

// We need to mock next/link because it's used in the sidebar
vi.mock("next/link", () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    }
  };
});

describe("Sidebar Component", () => {
  it("renders all expected navigation links", () => {
    render(<Sidebar />);
    
    // Check for the main brand/logo
    expect(screen.getByText(/Sessions/i)).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Rooms/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it("has the correct styling classes for a fixed 250px sidebar on desktop", () => {
    const { container } = render(<Sidebar />);
    const sidebarElement = container.firstChild as HTMLElement;
    
    expect(sidebarElement).toHaveClass("fixed");
    expect(sidebarElement).toHaveClass("w-[250px]");
    expect(sidebarElement).toHaveClass("h-screen");
    expect(sidebarElement).toHaveClass("bg-zinc-950"); // Deep obsidian
  });
});
