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

// ---------- Ensure Profile Exists ----------
// If user signed up before the DB trigger existed, create their profile now

async function ensureProfile(userId: string, email?: string, metadata?: any): Promise<Profile | null> {
  // Try fetching first
  let profile = await fetchProfile(userId);
  if (profile) return profile;

  // Profile doesn't exist — create it as a fallback
  const displayName =
    metadata?.full_name ||
    metadata?.user_name ||
    metadata?.name ||
    (email ? email.split('@')[0] : 'Student');

  const avatarUrl = metadata?.avatar_url || metadata?.picture || null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to create profile:', error.message);
    return null;
  }
  return data;
}

// ---------- Fetch Current User Profile (with auto-creation) ----------

export async function fetchCurrentProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  // Ensure profile exists (handles pre-trigger signups)
  return ensureProfile(
    session.user.id,
    session.user.email,
    session.user.user_metadata
  );
}

// ---------- Check if user has an active session ----------

export async function hasActiveSession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user?.id;
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
    const { data: { session } } = await supabase.auth.getSession();
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
