import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ParallaxData } from '@/components/ui/parallax-data';

// Mock framer-motion hooks
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
    useTransform: () => ({ get: () => 0, onChange: vi.fn() }),
  };
});

describe('ParallaxData', () => {
  it('renders brutalist typography for The Data', () => {
    render(<ParallaxData />);
    expect(screen.getByText(/THE METRICS/i)).toBeDefined();
    expect(screen.getByText(/PERFORMANCE TELEMETRY/i)).toBeDefined();
  });

  it('renders tasks and leaderboard visual elements', () => {
    render(<ParallaxData />);
    expect(screen.getByText(/TASKS_MOD/i)).toBeDefined();
    expect(screen.getByText(/LEADERBOARD_MOD/i)).toBeDefined();
  });
});
