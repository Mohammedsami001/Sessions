import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InkReveal from '../../../src/components/ui/ink-reveal';
import React from 'react';

describe('InkReveal Component', () => {
  beforeEach(() => {
    // Mock getContext for JSDOM
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      setTransform: vi.fn(),
      fillRect: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    } as any);
  });

  it('renders a canvas element with pointer-events: none', () => {
    const { container } = render(<InkReveal />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    // It should have pointer-events set to none so it doesn't block clicks
    expect(canvas?.style.pointerEvents).toBe('none');
  });
});
