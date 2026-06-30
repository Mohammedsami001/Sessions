import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthUI } from '@/components/ui/auth-ui';

describe('AuthUI Navigation and Toggle', () => {
  it('renders Sign In form by default when initialIsSignIn is true', () => {
    render(<AuthUI initialIsSignIn={true} />);
    
    // Should show Sign in header
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeDefined();
    expect(screen.getByText(/enter your email and password to access your account/i)).toBeDefined();
    
    // Should show Sessions branding and Back to Home
    expect(screen.getAllByText(/sessions/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /back to home/i })).toBeDefined();
    
    // Should show the sign in button
    const signInButton = screen.getByRole('button', { name: /^sign in$/i });
    expect(signInButton).toBeDefined();
    expect(signInButton.className).toContain('cursor-pointer');

    // Should have correct hover text and cursor on social buttons
    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    expect(googleBtn.className).toContain('cursor-pointer');
    expect(googleBtn.className).toContain('hover:text-gray-900');

    // Should NOT show Sign up fields (like name)
    expect(screen.queryByLabelText(/full name/i)).toBeNull();
  });

  it('renders Sign Up form by default when initialIsSignIn is false', () => {
    render(<AuthUI initialIsSignIn={false} />);
    
    // Should show Sign up header and branding
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeDefined();
    expect(screen.getAllByText(/sessions/i).length).toBeGreaterThan(0);
    
    // Should show the name field
    const nameField = screen.getByLabelText(/full name/i);
    expect(nameField).toBeDefined();
  });

  it('toggles between Sign In and Sign Up when clicking the link', () => {
    render(<AuthUI initialIsSignIn={true} />);
    
    // Starts on Sign In
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeDefined();
    
    // Click "Sign up" toggle button
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);
    
    // Should now be on Sign Up
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeDefined();
    expect(screen.getAllByText(/sessions/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
  });

  it('renders the VideoBackground', () => {
    const { container } = render(<AuthUI initialIsSignIn={true} />);
    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe('https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4');
  });
});
