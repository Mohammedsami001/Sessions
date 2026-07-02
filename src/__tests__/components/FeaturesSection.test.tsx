import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { FeaturesSection } from '@/components/ui/features-section';

// Mock matchMedia for framer-motion if needed
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

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver
  });
});

describe('FeaturesSection', () => {
  it('renders the system capabilities title', () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/System Capabilities/i)).toBeInTheDocument();
  });

  it('renders the three core modules', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('MOD_TIMER')).toBeInTheDocument();
    expect(screen.getByText('MOD_AUDIO')).toBeInTheDocument();
    expect(screen.getByText('MOD_STATS')).toBeInTheDocument();
  });
});
