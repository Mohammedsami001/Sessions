import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module to control auth behavior precisely
vi.mock('../lib/supabase', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    access_token: 'mock-token',
  };

  const mockFrom = vi.fn();
  const mockChannel = vi.fn();

  return {
    supabase: {
      from: mockFrom,
      channel: mockChannel,
      auth: {
        getSession: vi.fn(),
        signOut: vi.fn(),
      },
      removeChannel: vi.fn(),
    },
    getCurrentSession: vi.fn(),
    getCurrentUserId: vi.fn(),
    __mockSession: mockSession,
    __mockFrom: mockFrom,
    __mockChannel: mockChannel,
  };
});

// --- Test Suite: Room Creation ---
describe('createRoom', () => {
  let createRoom: typeof import('../lib/rooms').createRoom;
  let getCurrentSession: any;
  let mockFrom: any;

  beforeEach(async () => {
    vi.resetModules();
    const supabaseMock = await import('../lib/supabase') as any;
    getCurrentSession = supabaseMock.getCurrentSession;
    mockFrom = supabaseMock.__mockFrom;

    const roomsMod = await import('../lib/rooms');
    createRoom = roomsMod.createRoom;
  });

  it('returns null when user has no session', async () => {
    getCurrentSession.mockResolvedValue(null);

    const result = await createRoom({
      title: 'Study Room',
      category: 'General',
      visibility: 'public',
    });

    expect(result).toBeNull();
    // Should NOT attempt DB insert when unauthenticated
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('calls supabase insert with correct data when authenticated', async () => {
    const mockRoom = { id: 'room-abc', title: 'Study Room', host_id: 'user-123' };
    const mockSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockRoom, error: null }) });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });

    getCurrentSession.mockResolvedValue({
      user: { id: 'user-123' },
    });

    // joinRoom will also be called — mock that chain too
    const mockJoinSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: 'p1' }, error: null }) });
    const mockJoinUpsert = vi.fn().mockReturnValue({ select: mockJoinSelect });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'rooms') return { insert: mockInsert };
      if (table === 'room_participants') return { upsert: mockJoinUpsert };
      return {};
    });

    const result = await createRoom({
      title: 'Study Room',
      category: 'General',
      visibility: 'public',
    });

    expect(result).toEqual(mockRoom);
    expect(mockFrom).toHaveBeenCalledWith('rooms');
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Study Room',
      category: 'General',
      host_id: 'user-123',
      visibility: 'public',
    }));
  });
});

// --- Test Suite: Send Message ---
describe('sendMessage', () => {
  let sendMessage: typeof import('../lib/chat').sendMessage;
  let getCurrentSession: any;
  let mockFrom: any;

  beforeEach(async () => {
    vi.resetModules();
    const supabaseMock = await import('../lib/supabase') as any;
    getCurrentSession = supabaseMock.getCurrentSession;
    mockFrom = supabaseMock.__mockFrom;

    const chatMod = await import('../lib/chat');
    sendMessage = chatMod.sendMessage;
  });

  it('returns null when user has no session', async () => {
    getCurrentSession.mockResolvedValue(null);

    const result = await sendMessage('Hello world');

    expect(result).toBeNull();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('inserts message with correct user_id and content when authenticated', async () => {
    const mockMessage = { id: 'msg-1', content: 'Hello world', user_id: 'user-123', room_id: null };
    const mockSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockMessage, error: null }) });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });

    getCurrentSession.mockResolvedValue({
      user: { id: 'user-123' },
    });

    const result = await sendMessage('Hello world');

    expect(result).toEqual(mockMessage);
    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockInsert).toHaveBeenCalledWith({
      content: 'Hello world',
      room_id: null,
      user_id: 'user-123',
    });
  });

  it('sends room-scoped message when roomId is provided', async () => {
    const mockMessage = { id: 'msg-2', content: 'Room message', user_id: 'user-123', room_id: 'room-xyz' };
    const mockSelect = vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: mockMessage, error: null }) });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    mockFrom.mockReturnValue({ insert: mockInsert });

    getCurrentSession.mockResolvedValue({
      user: { id: 'user-123' },
    });

    const result = await sendMessage('Room message', 'room-xyz');

    expect(result).toEqual(mockMessage);
    expect(mockInsert).toHaveBeenCalledWith({
      content: 'Room message',
      room_id: 'room-xyz',
      user_id: 'user-123',
    });
  });
});

// --- Test Suite: Fetch Messages ---
describe('fetchRecentMessages', () => {
  let fetchRecentMessages: typeof import('../lib/chat').fetchRecentMessages;
  let mockFrom: any;

  beforeEach(async () => {
    vi.resetModules();
    const supabaseMock = await import('../lib/supabase') as any;
    mockFrom = supabaseMock.__mockFrom;

    const chatMod = await import('../lib/chat');
    fetchRecentMessages = chatMod.fetchRecentMessages;
  });

  it('fetches global messages when roomId is null', async () => {
    const mockMessages = [{ id: 'msg-1', content: 'Hello' }];
    const mockIs = vi.fn().mockResolvedValue({ data: mockMessages, error: null });
    const mockLimit = vi.fn().mockReturnValue({ eq: vi.fn(), is: mockIs });
    const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await fetchRecentMessages(null, 30);

    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockSelect).toHaveBeenCalledWith('*, profiles(display_name, avatar_url)');
    expect(result).toEqual(mockMessages);
  });
});

// --- Test Suite: EXP Level Computation (pure logic, no mocks needed) ---
describe('computeLevelProgress', () => {
  let computeLevel: typeof import('../lib/types').computeLevel;
  let computeLevelProgress: typeof import('../lib/types').computeLevelProgress;

  beforeEach(async () => {
    const typesMod = await import('../lib/types');
    computeLevel = typesMod.computeLevel;
    computeLevelProgress = typesMod.computeLevelProgress;
  });

  it('returns level 0 for 0 EXP', () => {
    expect(computeLevel(0)).toBe(0);
  });

  it('returns level 1 for exactly 100 EXP', () => {
    expect(computeLevel(100)).toBe(1);
  });

  it('returns level 2 for 350 EXP', () => {
    expect(computeLevel(350)).toBe(2);
  });

  it('computes progress correctly within a level', () => {
    // At 200 EXP: level 1, 100 into current level, 250 needed for level 2
    const info = computeLevelProgress(200);
    expect(info.level).toBe(1);
    expect(info.currentExp).toBe(100); // 200 - 100 (level 1 threshold)
    expect(info.nextLevelExp).toBe(250); // 350 - 100
    expect(info.progress).toBeCloseTo(40, 0); // 100/250 = 40%
  });
});
