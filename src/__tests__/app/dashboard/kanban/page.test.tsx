import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KanbanPage from '@/app/dashboard/kanban/page';

describe('KanbanPage', () => {
  it('renders the Kanban board template structure', () => {
    render(<KanbanPage />);
    
    // Header
    expect(screen.getByText('Private Workspace')).toBeDefined();
    expect(screen.getByText('Everyday Tasks Template')).toBeDefined();
    
    // Columns
    expect(screen.getByText('To Do')).toBeDefined();
    expect(screen.getByText('In Progress')).toBeDefined();
    expect(screen.getByText('Done')).toBeDefined();
    
    // Sample Card
    expect(screen.getByText('Read Chapter 5')).toBeDefined();
  });
});
