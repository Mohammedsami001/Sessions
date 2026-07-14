import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { ParallaxIdentity } from '@/components/ui/parallax-identity';

// Mock framer-motion hooks
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: vi.fn() } }),
    useTransform: () => ({ get: () => 0, onChange: vi.fn() }),
  };
});

describe('ParallaxIdentity', () => {
  it('renders massive brutalist typography for Identity CTA', () => {
    render(<ParallaxIdentity />);
    expect(screen.getByText(/SYSTEM READY/i)).toBeDefined();
    expect(screen.getByText(/INITIALIZE/i)).toBeDefined();
  });
});
