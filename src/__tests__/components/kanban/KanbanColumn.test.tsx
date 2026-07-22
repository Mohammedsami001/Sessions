import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KanbanColumn from '@/components/ui/kanban/kanban-column';
import KanbanCard from '@/components/ui/kanban/kanban-card';

describe('KanbanColumn', () => {
  it('renders the column title and count', () => {
    render(
      <KanbanColumn id="todo" title="To Do">
        <KanbanCard id="1" title="Task 1" />
        <KanbanCard id="2" title="Task 2" />
      </KanbanColumn>
    );
    expect(screen.getByText('To Do')).toBeDefined();
    // Assuming we render the count 2
    expect(screen.getByText('2')).toBeDefined();
  });

  it('renders children correctly', () => {
    render(
      <KanbanColumn id="todo" title="To Do">
        <div data-testid="child-card">Child</div>
      </KanbanColumn>
    );
    expect(screen.getByTestId('child-card')).toBeDefined();
  });
});
