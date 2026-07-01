import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProfileRepository } from '../../lib/adapters/in-memory-profile-repository';
import { InMemoryRoomRepository } from '../../lib/adapters/in-memory-room-repository';
import { InMemoryTaskRepository } from '../../lib/adapters/in-memory-task-repository';
import { InMemoryChatRepository } from '../../lib/adapters/in-memory-chat-repository';

describe('Repository Domain Logic (Moved from Services)', () => {
  describe('ProfileRepository.ensureProfile', () => {
    it('creates a profile with proper display name if missing', async () => {
      const repo = new InMemoryProfileRepository();
      const p1 = await repo.ensureProfile('user1', 'test@example.com', { full_name: 'Test User' });
      expect(p1?.display_name).toBe('Test User');

      const p2 = await repo.ensureProfile('user2', 'hello@example.com');
      expect(p2?.display_name).toBe('hello');
    });

    it('returns existing profile if found', async () => {
      const repo = new InMemoryProfileRepository();
      await repo.createProfile({ id: 'user1', display_name: 'Existing', avatar_url: null });
      
      const p = await repo.ensureProfile('user1', 'test@example.com');
      expect(p?.display_name).toBe('Existing');
    });
  });

  describe('RoomRepository.joinRoomByCode', () => {
    it('returns error if code is invalid', async () => {
      const repo = new InMemoryRoomRepository();
      const res = await repo.joinRoomByCode('INVALID', 'user1');
      expect(res.error).toBe('Invalid room code. Please check and try again.');
      expect(res.room).toBeNull();
    });

    it('joins successfully if code is valid', async () => {
      const repo = new InMemoryRoomRepository();
      const room = await repo.createRoom({ title: 'Test', visibility: 'public' } as any, 'host1');
      
      const res = await repo.joinRoomByCode(room!.join_code, 'user1');
      expect(res.error).toBeUndefined();
      expect(res.room?.id).toBe(room?.id);
    });
  });

  describe('TaskRepository.createTask', () => {
    it('trims whitespace and returns null if empty', async () => {
      const repo = new InMemoryTaskRepository();
      const t1 = await repo.createTask('   ', 'user1', null);
      expect(t1).toBeNull();

      const t2 = await repo.createTask('  hello  ', 'user1', null);
      expect(t2?.text).toBe('hello');
    });
  });

  describe('ChatRepository.sendMessage', () => {
    it('trims whitespace and returns null if empty', async () => {
      const repo = new InMemoryChatRepository();
      const m1 = await repo.sendMessage('   ', 'user1', null);
      expect(m1).toBeNull();

      const m2 = await repo.sendMessage('  hi there  ', 'user1', null);
      expect(m2?.content).toBe('hi there');
    });
  });
});
