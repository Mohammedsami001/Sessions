import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MinimalFooter } from '@/components/ui/minimal-footer';

describe('MinimalFooter', () => {
  it('renders the SESSIONS brand text', () => {
    render(<MinimalFooter />);
    expect(screen.getByText('SESSIONS')).toBeDefined();
  });

  it('renders standard footer links', () => {
    render(<MinimalFooter />);
    expect(screen.getByText('Study OS Protocol')).toBeDefined();
    expect(screen.getByText('System Guidelines')).toBeDefined();
    expect(screen.getByText('Sessions Home')).toBeDefined();
  });

  it('contains the copyright year', () => {
    render(<MinimalFooter />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} SESSIONS`, 'i'))).toBeDefined();
  });
});
