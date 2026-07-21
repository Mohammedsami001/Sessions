import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SidebarLayout from '@/components/ui/sidebar-layout';

// Mock the Sidebar component to just reflect its props
vi.mock('@/components/ui/sidebar', () => {
  return {
    default: function MockSidebar({ isCollapsed, isMobileOpen, onToggleCollapse, onToggleMobile }: any) {
      return (
        <div data-testid="mock-sidebar">
          <span data-testid="is-collapsed">{isCollapsed ? 'true' : 'false'}</span>
          <span data-testid="is-mobile-open">{isMobileOpen ? 'true' : 'false'}</span>
          <button data-testid="toggle-collapse-btn" onClick={onToggleCollapse}>Toggle Collapse</button>
          <button data-testid="toggle-mobile-btn" onClick={onToggleMobile}>Toggle Mobile</button>
        </div>
      );
    }
  };
});

describe('SidebarLayout', () => {
  it('renders children and default layout with sidebar not collapsed', () => {
    render(
      <SidebarLayout>
        <div data-testid="child-content">Main Content</div>
      </SidebarLayout>
    );

    expect(screen.getByTestId('child-content')).toBeTruthy();
    
    // Sidebar should default to not collapsed
    expect(screen.getByTestId('is-collapsed').textContent).toBe('false');
    
    // Main content wrapper should have md:ml-[250px]
    const contentWrapper = screen.getByTestId('child-content').parentElement;
    expect(contentWrapper?.className.includes('md:ml-[250px]')).toBe(true);
  });

  it('toggles collapse state when sidebar requests it', () => {
    render(
      <SidebarLayout>
        <div data-testid="child-content">Main Content</div>
      </SidebarLayout>
    );

    const toggleBtn = screen.getByTestId('toggle-collapse-btn');
    fireEvent.click(toggleBtn);

    // Sidebar should now be collapsed
    expect(screen.getByTestId('is-collapsed').textContent).toBe('true');
    
    // Main content wrapper should change to md:ml-[72px]
    const contentWrapper = screen.getByTestId('child-content').parentElement;
    expect(contentWrapper?.className.includes('md:ml-[72px]')).toBe(true);
  });

  it('toggles collapse state on Cmd+\\ keyboard shortcut', () => {
    render(
      <SidebarLayout>
        <div data-testid="child-content">Main Content</div>
      </SidebarLayout>
    );

    // Simulate Cmd+\ shortcut
    fireEvent.keyDown(window, { key: '\\', metaKey: true });

    expect(screen.getByTestId('is-collapsed').textContent).toBe('true');
    
    // Toggle back
    fireEvent.keyDown(window, { key: '\\', metaKey: true });
    expect(screen.getByTestId('is-collapsed').textContent).toBe('false');
  });
});
