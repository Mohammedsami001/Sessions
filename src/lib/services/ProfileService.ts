import type { IProfileRepository } from '../ports';
import type { Profile } from '../types';

export class ProfileService {
  constructor(private repo: IProfileRepository) {}

  async ensureProfile(userId: string, email?: string, metadata?: Record<string, any>): Promise<Profile | null> {
    const existing = await this.repo.fetchProfile(userId);
    if (existing) {
      return existing;
    }

    const displayName =
      metadata?.full_name ||
      metadata?.user_name ||
      metadata?.name ||
      (email ? email.split('@')[0] : 'Student');

    const avatarUrl = metadata?.avatar_url || metadata?.picture || null;

    return await this.repo.createProfile({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
    });
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    return this.repo.updateProfile(userId, updates);
  }

  async deleteAccount(userId: string): Promise<boolean> {
    return this.repo.deleteAccount(userId);
  }
}
