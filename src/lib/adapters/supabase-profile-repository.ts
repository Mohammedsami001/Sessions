import { supabase } from '../supabase';
import type { IProfileRepository } from '../ports';
import type { Profile } from '../types';

export class SupabaseProfileRepository implements IProfileRepository {
  async fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Failed to fetch profile:', error.message);
      }
      return null;
    }
    return data;
  }

  async createProfile(profileData: Omit<Profile, 'created_at' | 'updated_at' | 'total_focus_seconds' | 'exp' | 'total_sessions' | 'streak_days' | 'last_active_date' | 'is_pro'>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create profile:', error.message, error.code);
      if (error.code === '23505') {
        return this.fetchProfile(profileData.id);
      }
      return null;
    }
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      console.error('Failed to update profile:', error.message);
      return null;
    }
    return data;
  }

  async deleteAccount(userId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return false;
    }
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        return false;
      }
      await supabase.auth.signOut();
      return true;
    } catch (err: any) {
      return false;
    }
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
}
