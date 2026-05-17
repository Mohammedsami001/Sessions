import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create a real client when we have valid credentials
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Reliable user ID — uses getUser() which validates JWT with the server.
// getSession() reads from localStorage and can return stale/null data.
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

// Reliable session — tries getUser() first (server-validated),
// then builds a session-like object for callers that need user.id.
// Falls back to getSession() for the full token if getUser() succeeds.
export async function getCurrentSession() {
  try {
    // First validate the user is real via server round-trip
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // User is valid — get the local session for the access token
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session;

    // Edge case: getUser() works but getSession() returns null
    // (can happen when localStorage is corrupted but the cookie/token is valid)
    // Return a minimal session-like object so callers that only need user.id work
    return { user, access_token: '' } as any;
  } catch {
    return null;
  }
}
