import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => {
  const mockFrom = vi.fn();
  return {
    supabase: {
      from: mockFrom,
      auth: { getSession: vi.fn(), getUser: vi.fn() },
      channel: vi.fn(),
      removeChannel: vi.fn(),
    },
    getCurrentSession: vi.fn(),
    getCurrentUserId: vi.fn(),
    __mockFrom: mockFrom,
  };
});

describe('deleteRoom', () => {
  let deleteRoom: typeof import('../lib/rooms').deleteRoom;
  let getCurrentSession: any;
  let mockFrom: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const supabaseMock = await import('../lib/supabase') as any;
    getCurrentSession = supabaseMock.getCurrentSession;
    mockFrom = supabaseMock.__mockFrom;
    const roomsMod = await import('../lib/rooms');
    deleteRoom = roomsMod.deleteRoom;
  });

  it('returns false when user has no session', async () => {
    getCurrentSession.mockResolvedValue(null);
    const result = await deleteRoom('room-123');
    expect(result).toBe(false);
  });

  it('returns false when user is not the host', async () => {
    getCurrentSession.mockResolvedValue({ user: { id: 'user-456' } });

    // Mock room fetch — host_id is different user
    const mockSingle = vi.fn().mockResolvedValue({ data: { host_id: 'user-789' }, error: null });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await deleteRoom('room-123');
    expect(result).toBe(false);
  });

  it('deletes participants then room when user is host', async () => {
    getCurrentSession.mockResolvedValue({ user: { id: 'user-123' } });

    // Chain: first call fetches room, subsequent calls delete
    const mockDeleteParticipants = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteRoom = vi.fn().mockResolvedValue({ error: null });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rooms' && callCount === 0) {
        callCount++;
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { host_id: 'user-123' }, error: null })
            })
          })
        };
      }
      if (table === 'room_participants') {
        return { delete: vi.fn().mockReturnValue({ eq: mockDeleteParticipants }) };
      }
      if (table === 'rooms') {
        return { delete: vi.fn().mockReturnValue({ eq: mockDeleteRoom }) };
      }
      return {};
    });

    const result = await deleteRoom('room-123');
    expect(result).toBe(true);
  });
});

describe('leaveRoom host transfer', () => {
  let leaveRoom: typeof import('../lib/rooms').leaveRoom;
  let getCurrentSession: any;
  let mockFrom: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const supabaseMock = await import('../lib/supabase') as any;
    getCurrentSession = supabaseMock.getCurrentSession;
    mockFrom = supabaseMock.__mockFrom;
    const roomsMod = await import('../lib/rooms');
    leaveRoom = roomsMod.leaveRoom;
  });

  it('transfers host to earliest participant when host leaves', async () => {
    getCurrentSession.mockResolvedValue({ user: { id: 'host-user' } });

    const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'rooms') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { host_id: 'host-user' }, error: null })
            })
          }),
          update: mockUpdate,
        };
      }
      if (table === 'room_participants') {
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: { user_id: 'next-host' }, error: null })
                })
              })
            })
          }),
        };
      }
      return {};
    });

    const result = await leaveRoom('room-123');
    expect(result).toBe(true);
  });
});
