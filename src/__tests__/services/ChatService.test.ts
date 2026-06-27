import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryChatRepository } from '../../lib/adapters/in-memory-chat-repository';
import { ChatService } from '../../lib/services/ChatService';

describe('ChatService', () => {
  let repo: InMemoryChatRepository;
  let service: ChatService;

  beforeEach(() => {
    repo = new InMemoryChatRepository();
    service = new ChatService(repo);
  });

  it('can send and fetch messages', async () => {
    await service.sendMessage('Hello global', 'user-1', null);
    await service.sendMessage('Hello room', 'user-1', 'room-1');

    const globalMsgs = await service.fetchRecentMessages(null);
    expect(globalMsgs).toHaveLength(1);
    expect(globalMsgs[0].content).toBe('Hello global');

    const roomMsgs = await service.fetchRecentMessages('room-1');
    expect(roomMsgs).toHaveLength(1);
    expect(roomMsgs[0].content).toBe('Hello room');
  });

  it('can subscribe to messages', async () => {
    let received = 0;
    const { unsubscribe } = service.subscribeToMessages('room-1', (msg) => {
      received++;
      expect(msg.content).toBe('Ping');
    });

    await service.sendMessage('Ping', 'user-1', 'room-1');
    await service.sendMessage('Global ping', 'user-1', null); // Shouldn't trigger

    expect(received).toBe(1);
    unsubscribe();
  });
});
