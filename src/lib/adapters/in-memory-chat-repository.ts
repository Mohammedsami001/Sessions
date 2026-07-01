import type { IChatRepository } from '../ports';
import type { MessageWithProfile } from '../types';

export class InMemoryChatRepository implements IChatRepository {
  private messages: MessageWithProfile[] = [];
  private nextId = 1;
  private subscribers: Array<{ roomId: string | null, cb: (msg: MessageWithProfile) => void }> = [];

  async fetchRecentMessages(roomId: string | null, limit: number = 30): Promise<MessageWithProfile[]> {
    const filtered = this.messages.filter(m => m.room_id === roomId);
    return filtered.slice(-limit);
  }

  async sendMessage(content: string, userId: string, roomId: string | null): Promise<MessageWithProfile | null> {
    if (!content.trim() || !userId) return null;
    const msg: MessageWithProfile = {
      id: `msg-${this.nextId++}`,
      content: content.trim(),
      user_id: userId,
      room_id: roomId,
      created_at: new Date().toISOString(),
      profiles: { display_name: 'Test User', avatar_url: null },
    };
    this.messages.push(msg);

    // notify subscribers
    this.subscribers.forEach(sub => {
      if (sub.roomId === roomId) {
        sub.cb(msg);
      }
    });

    return msg;
  }

  subscribeToMessages(roomId: string | null, callback: (msg: MessageWithProfile) => void) {
    const sub = { roomId, cb: callback };
    this.subscribers.push(sub);
    return {
      unsubscribe: () => {
        this.subscribers = this.subscribers.filter(s => s !== sub);
      }
    };
  }
}
