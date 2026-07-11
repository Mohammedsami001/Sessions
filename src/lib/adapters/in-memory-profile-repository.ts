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

  async ensureProfile(userId: string, email?: string, metadata?: Record<string, any>): Promise<Profile | null> {
    const existing = await this.fetchProfile(userId);
    if (existing) {
      return existing;
    }

    const displayName =
      metadata?.full_name ||
      metadata?.user_name ||
      metadata?.name ||
      (email ? email.split('@')[0] : 'Student');

    const avatarUrl = metadata?.avatar_url || metadata?.picture || null;

    return await this.createProfile({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
    });
  }

  async addFocusSession(userId: string, minutes: number): Promise<Profile | null> {
    const profile = await this.fetchProfile(userId);
    if (!profile) return null;

    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak_days || 0;
    
    if (profile.last_active_date) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (profile.last_active_date === yesterdayStr) {
        newStreak += 1;
      } else if (profile.last_active_date !== today) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    return await this.updateProfile(userId, {
      total_sessions: (profile.total_sessions || 0) + 1,
      total_focus_seconds: (profile.total_focus_seconds || 0) + (minutes * 60),
      exp: (profile.exp || 0) + (minutes * 10),
      streak_days: newStreak,
      last_active_date: today,
    });
  }
}
