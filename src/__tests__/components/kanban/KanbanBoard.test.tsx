import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KanbanBoard from '@/components/ui/kanban/kanban-board';

describe('KanbanBoard', () => {
  it('renders children correctly', () => {
    render(
      <KanbanBoard>
        <div data-testid="child-col">Child Column</div>
      </KanbanBoard>
    );
    expect(screen.getByTestId('child-col')).toBeDefined();
  });
});
