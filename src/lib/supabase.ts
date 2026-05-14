import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '✦ Sessions Warning: Supabase client initialized without active environment keys. Authentication API requests will be mocked or fail gracefully until NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are populated in .env.local ✦'
  );
}

// Export singleton client optimized for client-side Auth and Realtime sync
export const supabase = createClient(
  supabaseUrl || 'https://your-project-id.supabase.co',
  supabaseAnonKey || 'your-anon-key'
);
