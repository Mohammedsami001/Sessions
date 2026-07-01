import { render, screen } from '@testing-library/react';
import { SessionsHero } from '../../components/ui/sessions-hero';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Next.js Link component often needs basic mocking in simple vitest setups, 
// but we'll try to just render it first to see if RTL handles it properly.
// Sometimes Next.js links render as anchor tags in tests.

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = () => null;
  unobserve = () => null;
  disconnect = () => null;
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

describe('SessionsHero Navigation', () => {
  it('renders correct navigation links for the Study OS', () => {
    render(<SessionsHero />);
    
    const featuresLink = screen.getByRole('link', { name: /features/i });
    expect(featuresLink.getAttribute('href')).toBe('/#features');
    
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink.getAttribute('href')).toBe('/login');
    
    const signUpLink = screen.getByRole('link', { name: /create account/i });
    expect(signUpLink.getAttribute('href')).toBe('/signup');
  });

  it('renders grounded hero content and correct CTA link', () => {
    render(<SessionsHero />);
    
    // Using screen.getByText with regex for the expected new copy
    const paragraph = screen.getByText(/A synchronized Study OS designed for deep work/i);
    expect(paragraph).toBeDefined();
    
    const ctaButton = screen.getByRole('link', { name: /launch study os/i });
    expect(ctaButton.getAttribute('href')).toBe('/dashboard');
  });

  it('renders the VideoBackground', () => {
    const { container } = render(<SessionsHero />);
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe('https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4');
  });
});
