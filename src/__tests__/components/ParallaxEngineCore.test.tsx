import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ParallaxEngineCore } from '@/components/ui/parallax-engine-core';

// Mock framer-motion hooks
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
    useTransform: () => ({ get: () => 0, onChange: vi.fn() }),
  };
});

describe('ParallaxEngineCore', () => {
  it('renders brutalist typography for Engine Core', () => {
    render(<ParallaxEngineCore />);
    expect(screen.getByText(/THE ENGINE CORE/i)).toBeDefined();
    expect(screen.getByText(/SYNCHRONIZED FOCUS/i)).toBeDefined();
  });

  it('renders timer and audio elements', () => {
    render(<ParallaxEngineCore />);
    expect(screen.getByText(/IGNITE/i)).toBeDefined();
    expect(screen.getByTestId('audio-visualizer')).toBeDefined();
  });
});
