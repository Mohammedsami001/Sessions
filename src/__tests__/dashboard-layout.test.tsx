import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../app/dashboard/page';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user', email: 'test@example.com' } } }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    }),
  }
}));

// We need to mock the services because they fetch real data
vi.mock('../lib/container', () => ({
  profileService: {
    ensureProfile: vi.fn().mockResolvedValue({ id: 'test-user', full_name: 'Test', username: 'test', exp: 100 }),
    getProfile: vi.fn().mockResolvedValue({ id: 'test-user', full_name: 'Test', username: 'test', exp: 100 }),
    updateUserStatus: vi.fn()
  },
  taskService: {
    fetchTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn(),
    deleteTask: vi.fn(),
    toggleTask: vi.fn(),
    updateTask: vi.fn()
  },
  roomService: {
    fetchPublicRooms: vi.fn().mockResolvedValue([]),
    getParticipantCounts: vi.fn().mockResolvedValue({}),
    subscribeToPublicRooms: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    subscribeToPublicParticipants: vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
  },
  chatService: {
    fetchRecentMessages: vi.fn().mockResolvedValue([]),
    fetchGlobalMessages: vi.fn().mockResolvedValue([]),
    subscribeToMessages: vi.fn().mockReturnValue({ unsubscribe: vi.fn() })
  }
}));

describe('Dashboard Layout Rearchitecture', () => {
  it('renders the 3-column cockpit layout', async () => {
    render(<DashboardPage />);
    
    // We expect the main grid container to exist
    const leftColumn = await screen.findByTestId('left-column-tasks');
    const centerColumn = await screen.findByTestId('center-column-execution');
    const rightColumn = await screen.findByTestId('right-column-community');
    
    expect(leftColumn).not.toBeNull();
    expect(centerColumn).not.toBeNull();
    expect(rightColumn).not.toBeNull();
    
    // The EngineCoreWidget should be isolated in the center column
    const engineCore = screen.getByTestId('engine-core-widget');
    expect(centerColumn?.contains(engineCore)).toBe(true);
  });
});
