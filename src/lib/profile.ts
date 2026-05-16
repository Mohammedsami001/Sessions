import { supabase, getCurrentSession } from './supabase';
import type { Profile } from './types';

// ---------- Fetch Profile ----------

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = "0 rows" which is expected for new users, don't log it
    if (error.code !== 'PGRST116') {
      console.error('Failed to fetch profile:', error.message);
    }
    return null;
  }
  return data;
}

// ---------- Ensure Profile Exists ----------

async function ensureProfile(userId: string, email?: string, metadata?: Record<string, any>): Promise<Profile | null> {
  let profile = await fetchProfile(userId);
  if (profile) return profile;

  // Profile doesn't exist — create it
  const displayName =
    metadata?.full_name ||
    metadata?.user_name ||
    metadata?.name ||
    (email ? email.split('@')[0] : 'Student');

  const avatarUrl = metadata?.avatar_url || metadata?.picture || null;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create profile:', error.message, error.code);
    // If insert failed due to conflict, try fetching again
    if (error.code === '23505') {
      return fetchProfile(userId);
    }
    return null;
  }
  return data;
}

// ---------- Fetch Current User Profile ----------

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  return ensureProfile(
    session.user.id,
    session.user.email || undefined,
    session.user.user_metadata
  );
}

// ---------- Update Profile ----------

export async function updateProfile(
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>
): Promise<Profile | null> {
  const session = await getCurrentSession();
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
    const session = await getCurrentSession();
    if (!session?.access_token) {
      return { success: false, error: 'No active session' };
    }

    const response = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete account' };
    }
    await supabase.auth.signOut();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
