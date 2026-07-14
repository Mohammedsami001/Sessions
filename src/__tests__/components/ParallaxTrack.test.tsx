import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ParallaxTrack } from '@/components/ui/parallax-track';

// Mock matchMedia for framer-motion
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('ParallaxTrack', () => {
  it('renders children within the brutalist track container', () => {
    render(
      <ParallaxTrack>
        <div data-testid="parallax-child">Child Element</div>
      </ParallaxTrack>
    );
    expect(screen.getByTestId('parallax-child')).toBeDefined();
  });
});
