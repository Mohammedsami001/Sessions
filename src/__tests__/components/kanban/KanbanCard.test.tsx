import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import KanbanCard from '@/components/ui/kanban/kanban-card';

describe('KanbanCard', () => {
  const defaultProps = {
    id: 'task-1',
    title: 'Study OS Redesign',
    tags: ['Design', 'High Priority'],
    dueDate: 'Tomorrow',
  };

  it('renders the title correctly', () => {
    render(<KanbanCard {...defaultProps} />);
    expect(screen.getByText('Study OS Redesign')).toBeDefined();
  });

  it('renders tags if provided', () => {
    render(<KanbanCard {...defaultProps} />);
    expect(screen.getByText('Design')).toBeDefined();
    expect(screen.getByText('High Priority')).toBeDefined();
  });

  it('renders due date if provided', () => {
    render(<KanbanCard {...defaultProps} />);
    expect(screen.getByText('Tomorrow')).toBeDefined();
  });

  it('applies the correct styling for dark mode constraints', () => {
    const { container } = render(<KanbanCard {...defaultProps} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-zinc-900/50');
    expect(card.className).toContain('border-white/5');
    expect(card.className).toContain('rounded-xl'); // max 12px border radius
  });
});
