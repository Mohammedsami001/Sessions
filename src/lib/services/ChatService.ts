import type { IChatRepository } from '../ports';
import type { MessageWithProfile } from '../types';

export class ChatService {
  constructor(private repo: IChatRepository) {}

  async fetchRecentMessages(roomId: string | null, limit: number = 30): Promise<MessageWithProfile[]> {
    return this.repo.fetchRecentMessages(roomId, limit);
  }

  async sendMessage(content: string, userId: string, roomId: string | null = null): Promise<MessageWithProfile | null> {
    if (!content.trim() || !userId) return null;
    return this.repo.sendMessage(content.trim(), userId, roomId);
  }

  subscribeToMessages(roomId: string | null, callback: (msg: MessageWithProfile) => void): { unsubscribe: () => void } {
    return this.repo.subscribeToMessages(roomId, callback);
  }
}
