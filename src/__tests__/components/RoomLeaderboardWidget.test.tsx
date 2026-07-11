import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RoomLeaderboardWidget from '../../components/ui/room-leaderboard-widget';

describe('RoomLeaderboardWidget', () => {
  const mockParticipants = [
    { id: '1', profile: { user_name: 'Alice', exp: 1200 }, role: 'host' },
    { id: '2', profile: { user_name: 'Bob', exp: 800 }, role: 'member' },
    { id: '3', profile: { user_name: 'Charlie', exp: 1500 }, role: 'member' },
  ];

  it('renders leaderboard title', () => {
    render(<RoomLeaderboardWidget participants={mockParticipants} />);
    expect(screen.getByText('Room Leaderboard')).not.toBeNull();
  });

  it('renders participants sorted by exp', () => {
    render(<RoomLeaderboardWidget participants={mockParticipants} />);
    const items = screen.getAllByTestId('leaderboard-item');
    expect(items).toHaveLength(3);
    
    // Charlie (1500), Alice (1200), Bob (800)
    expect(items[0].textContent).toContain('Charlie');
    expect(items[1].textContent).toContain('Alice');
    expect(items[2].textContent).toContain('Bob');
  });

  it('highlights the host', () => {
    render(<RoomLeaderboardWidget participants={mockParticipants} />);
    const items = screen.getAllByTestId('leaderboard-item');
    // Alice is host, but she's second in array
    expect(items[1].textContent).toContain('HOST');
  });
});
