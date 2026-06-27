import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRoomRepository } from '../../lib/adapters/in-memory-room-repository';
import { RoomService } from '../../lib/services/RoomService';

describe('RoomService', () => {
  let repo: InMemoryRoomRepository;
  let service: RoomService;

  beforeEach(() => {
    repo = new InMemoryRoomRepository();
    service = new RoomService(repo);
  });

  it('can create a room, fetch it, and join it', async () => {
    const room = await service.createRoom({
      title: 'Test Room',
      category: 'Work',
      visibility: 'public'
    }, 'user-1');

    expect(room).not.toBeNull();
    if (!room) return;

    expect(room.title).toBe('Test Room');
    expect(room.host_id).toBe('user-1');

    const fetched = await service.fetchRoom(room.id);
    expect(fetched?.id).toBe(room.id);

    // Host should be automatically joined
    const parts = await service.fetchParticipants(room.id);
    expect(parts.length).toBe(1);
    expect(parts[0].user_id).toBe('user-1');

    // Someone else joins
    const part2 = await service.joinRoom(room.id, 'user-2');
    expect(part2).not.toBeNull();
    
    const partsUpdated = await service.fetchParticipants(room.id);
    expect(partsUpdated.length).toBe(2);
  });

  it('can start, pause, and reset timer', async () => {
    const room = await service.createRoom({
      title: 'Timer Room',
      category: 'Work',
      visibility: 'private'
    }, 'host-1');
    if (!room) return;

    await service.startTimer(room.id, 'focus');
    let fetched = await service.fetchRoom(room.id);
    expect(fetched?.timer_status).toBe('focus');
    expect(fetched?.timer_started_at).not.toBeNull();

    await service.pauseTimer(room.id);
    fetched = await service.fetchRoom(room.id);
    expect(fetched?.timer_status).toBe('idle');
    expect(fetched?.timer_started_at).not.toBeNull(); // anchors are preserved for pause

    await service.resetTimer(room.id);
    fetched = await service.fetchRoom(room.id);
    expect(fetched?.timer_status).toBe('idle');
    expect(fetched?.timer_started_at).toBeNull();
  });
});
