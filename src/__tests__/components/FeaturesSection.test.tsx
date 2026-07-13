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
  it('renders the interactive Synchronized Timers card', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Synchronized Timers')).toBeInTheDocument();
    const playButton = screen.getByRole('button', { name: /start timer/i });
    expect(playButton).toBeInTheDocument();
  });

  it('renders the interactive Atmospheric Control card', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Atmospheric Control')).toBeInTheDocument();
    const audioToggle = screen.getByRole('button', { name: /toggle audio/i });
    expect(audioToggle).toBeInTheDocument();
  });

  it('renders the interactive Performance Telemetry card', () => {
    render(<FeaturesSection />);
    expect(screen.getByText('Performance Telemetry')).toBeInTheDocument();
    // E.g., we expect to see a mock chart or streak counter
    expect(screen.getByTestId('stats-chart')).toBeInTheDocument();
  });
});
