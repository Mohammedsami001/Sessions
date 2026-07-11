import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComplexTaskTrackerWidget from '../../components/ui/complex-task-tracker-widget';
import type { Task } from '../../lib/types';

describe('ComplexTaskTrackerWidget', () => {
  const mockTasks: Task[] = [
    { id: '1', user_id: 'user1', room_id: null, scope: 'global', text: 'Global Task 1', completed: false, created_at: '2023-01-01' },
    { id: '2', user_id: 'user1', room_id: 'room1', scope: 'room', text: 'Room Task 1', completed: false, created_at: '2023-01-02' }
  ];

  const defaultProps = {
    tasks: mockTasks,
    currentRoomId: null,
    onAddTask: vi.fn(),
    onToggleTask: vi.fn(),
    onDeleteTask: vi.fn(),
    onUpdateTask: vi.fn(),
  };

  it('renders both global and room task tabs', () => {
    render(<ComplexTaskTrackerWidget {...defaultProps} />);
    expect(screen.getByText('Global Tasks')).not.toBeNull();
    expect(screen.getByText('Room Tasks')).not.toBeNull();
  });

  it('shows global tasks by default', () => {
    render(<ComplexTaskTrackerWidget {...defaultProps} />);
    expect(screen.getByText('Global Task 1')).not.toBeNull();
    expect(screen.queryByText('Room Task 1')).toBeNull();
  });

  it('switches to room tasks when tab is clicked', () => {
    render(<ComplexTaskTrackerWidget {...defaultProps} />);
    const roomTab = screen.getByText('Room Tasks');
    fireEvent.click(roomTab);
    
    expect(screen.queryByText('Global Task 1')).toBeNull();
    expect(screen.getByText('Room Task 1')).not.toBeNull();
  });

  it('allows adding a new task with a priority', () => {
    render(<ComplexTaskTrackerWidget {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Add a new task...');
    fireEvent.change(input, { target: { value: 'New High Priority Task' } });
    
    // Assume there is a select or button to set priority
    const priorityButton = screen.getByLabelText('Set Priority');
    fireEvent.click(priorityButton);
    const highPriorityOption = screen.getByText('High');
    fireEvent.click(highPriorityOption);
    
    const form = screen.getByTestId('add-task-form');
    fireEvent.submit(form);
    
    expect(defaultProps.onAddTask).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'New High Priority Task',
        priority: 'high',
        scope: 'global' // defaults to active tab
      })
    );
  });
});
