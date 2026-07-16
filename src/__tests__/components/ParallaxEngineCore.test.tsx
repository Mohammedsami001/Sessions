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
  it("renders typography elements", () => {
    render(<ParallaxEngineCore />);
    expect(screen.getByText(/THE WORKSPACE/i)).toBeDefined();
    expect(screen.getByText(/YOUR ENVIRONMENT/i)).toBeDefined();
  });

  it('renders timer and audio elements', () => {
    render(<ParallaxEngineCore />);
    expect(screen.getByText(/IGNITE/i)).toBeDefined();
    expect(screen.getByTestId('audio-visualizer')).toBeDefined();
  });
});
