import { supabase } from './supabase';
import type { Profile } from './types';

// ---------- Fetch Profile ----------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }
  return data;
}

// ---------- Fetch Current User Profile ----------

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;
  return fetchProfile(session.user.id);
}

// ---------- Update Profile ----------

export async function updateProfile(
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>
): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile:', error.message);
    return null;
  }
  return data;
}

// ---------- Delete Account ----------

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/delete-account', { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete account' };
    }
    // Sign out client-side after server deletion
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
