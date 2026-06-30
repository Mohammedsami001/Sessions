import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthUI } from '@/components/ui/auth-ui';

describe('AuthUI Navigation and Toggle', () => {
  it('renders Sign In form by default when initialIsSignIn is true', () => {
    render(<AuthUI initialIsSignIn={true} />);
    
    // Should show Sign in header
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeDefined();
    expect(screen.getByText(/enter your email below to sign in/i)).toBeDefined();
    
    // Should show the sign in button
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeDefined();

    // Should NOT show Sign up fields (like name)
    expect(screen.queryByLabelText(/full name/i)).toBeNull();
  });

  it('renders Sign Up form by default when initialIsSignIn is false', () => {
    render(<AuthUI initialIsSignIn={false} />);
    
    // Should show Sign up header
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeDefined();
    
    // Should show the name field
    const nameField = screen.getByLabelText(/full name/i);
    expect(nameField).toBeDefined();
  });

  it('toggles between Sign In and Sign Up when clicking the link', () => {
    render(<AuthUI initialIsSignIn={true} />);
    
    // Starts on Sign In
    expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeDefined();
    
    // Click "Sign up" toggle button
    const toggleButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(toggleButton);
    
    // Should now be on Sign Up
    expect(screen.getByRole('heading', { name: /create an account/i })).toBeDefined();
    expect(screen.getByLabelText(/full name/i)).toBeDefined();
  });
});
