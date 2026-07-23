import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
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
  it("renders all expected navigation links when expanded", () => {
    render(<Sidebar />);
    
    // Check for the main brand/logo
    expect(screen.getAllByText(/Sessions/i)[0]).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Rooms/i)).toBeInTheDocument();
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it("renders the Go Pro widget when expanded and no Lo-fi Focus widget", () => {
    render(<Sidebar />);
    
    // Check Go Pro widget
    expect(screen.getByText(/Go Pro/i)).toBeInTheDocument();
    expect(screen.getByText(/Upgrade Now/i)).toBeInTheDocument();
    
    // Check Lo-fi Focus widget is removed
    expect(screen.queryByText(/Lo-fi Focus/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chillhop Essentials/i)).not.toBeInTheDocument();
  });

  it("has the correct styling classes for a fixed 250px sidebar on desktop when expanded", () => {
    const { container } = render(<Sidebar isCollapsed={false} />);
    const sidebarElement = container.firstChild as HTMLElement;
    
    expect(sidebarElement).toHaveClass("fixed");
    expect(sidebarElement).toHaveClass("w-[250px]");
    expect(sidebarElement).toHaveClass("h-screen");
    expect(sidebarElement).toHaveClass("bg-zinc-950"); // Deep obsidian
  });

  it("has the correct styling classes for a 72px sidebar when collapsed", () => {
    const { container } = render(<Sidebar isCollapsed={true} />);
    const sidebarElement = container.firstChild as HTMLElement;
    
    expect(sidebarElement).toHaveClass("w-[72px]");
    expect(sidebarElement).not.toHaveClass("w-[250px]");
  });

  it("hides text labels when collapsed", () => {
    render(<Sidebar isCollapsed={true} />);
    
    // Navigation labels should be visually hidden or completely removed
    // We'll check they don't exist as standard visible text
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Profile/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Go Pro/i)).not.toBeInTheDocument();
  });

  it("calls onToggleCollapse when the toggle button is clicked", () => {
    const onToggleMock = vi.fn();
    render(<Sidebar onToggleCollapse={onToggleMock} />);
    
    const toggleButton = screen.getByTestId('sidebar-toggle-btn');
    fireEvent.click(toggleButton);
    
    expect(onToggleMock).toHaveBeenCalledTimes(1);
  });
});
