import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ParallaxNetwork } from '@/components/ui/parallax-network';

// Mock framer-motion hooks
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
    useTransform: () => ({ get: () => 0, onChange: vi.fn() }),
  };
});

describe('ParallaxNetwork', () => {
  it('renders brutalist typography for The Network', () => {
    render(<ParallaxNetwork />);
    expect(screen.getByText(/THE NETWORK/i)).toBeDefined();
    expect(screen.getByText(/SHARED SESSIONS/i)).toBeDefined();
  });

  it('renders chat and room visual elements', () => {
    render(<ParallaxNetwork />);
    expect(screen.getByText(/CHAT_MOD/i)).toBeDefined();
    expect(screen.getByText(/ROOMS_MOD/i)).toBeDefined();
  });
});
