import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InkRevealFooter } from '../../../src/components/ui/ink-reveal-footer';
import React from 'react';

// Mock InkReveal to just render a dummy canvas so we don't have to mock getContext here if we don't want to,
// but actually we already mocked it globally or we can just let it render.
describe('InkRevealFooter Component', () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      setTransform: vi.fn(),
      fillRect: vi.fn(),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    } as any);
  });

  it('renders the SESSIONS logo and navigation links', () => {
    render(<InkRevealFooter />);
    
    // Check for logo
    const elements = screen.getAllByText('SESSIONS');
    expect(elements.length).toBeGreaterThan(0);
    
    // Check for navigation links
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).not.toBeNull();
    expect(dashboardLink.closest('a')).toHaveProperty('href', expect.stringContaining('/dashboard'));
    
    // Check for canvas (the mask overlay)
    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });
});
