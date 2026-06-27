import type { IProfileRepository } from '../ports';
import type { Profile } from '../types';

export class InMemoryProfileRepository implements IProfileRepository {
  private profiles: Map<string, Profile> = new Map();

  async fetchProfile(userId: string): Promise<Profile | null> {
    return this.profiles.get(userId) || null;
  }

  async createProfile(profileData: Omit<Profile, 'created_at' | 'updated_at' | 'total_focus_seconds' | 'exp' | 'total_sessions' | 'streak_days' | 'last_active_date' | 'is_pro'>): Promise<Profile | null> {
    const profile: Profile = {
      ...profileData,
      total_focus_seconds: 0,
      exp: 0,
      total_sessions: 0,
      streak_days: 0,
      last_active_date: null,
      is_pro: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const existing = this.profiles.get(userId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    this.profiles.set(userId, updated);
    return updated;
  }

  async deleteAccount(userId: string): Promise<boolean> {
    return this.profiles.delete(userId);
  }
}
