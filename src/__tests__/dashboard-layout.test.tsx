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
    const { container } = render(<DashboardPage />);
    
    expect(await screen.findByTestId('left-column-tasks')).not.toBeNull();
    expect(await screen.findByTestId('center-column-execution')).not.toBeNull();
    expect(await screen.findByTestId('right-column-community')).not.toBeNull();
  });

  it('renders Active Rooms in the right column community section', async () => {
    render(<DashboardPage />);
    const rightCol = await screen.findByTestId('right-column-community');
    expect(rightCol.textContent).toContain('Active Rooms');
  });  

  it('verifies the EngineCoreWidget position', async () => {
    render(<DashboardPage />);
    const centerColumn = await screen.findByTestId('center-column-execution');
    const engineCore = screen.getByTestId('engine-core-widget');
    expect(centerColumn?.contains(engineCore)).toBe(true);
  });
});
