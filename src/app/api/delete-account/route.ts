import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  try {
    // Get the user's session from the authorization header
    const authHeader = request.headers.get('authorization');
    
    // Create a client with the anon key to verify the user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error. Missing environment variables.' },
        { status: 500 }
      );
    }

    // Create anon client to get current user from cookie/token
    const anonClient = createClient(supabaseUrl, supabaseAnonKey || '');
    
    // Try to get user from auth header or cookie
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user }, error } = await anonClient.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. No valid session found.' },
        { status: 401 }
      );
    }

    // Create admin client with service role key for deletion
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Cascading deletes happen automatically via ON DELETE CASCADE in the schema,
    // but we explicitly clean up to be safe:

    // 1. Delete user's tasks
    await adminClient.from('tasks').delete().eq('user_id', userId);

    // 2. Delete user's messages (or anonymize — keeping delete for now)
    await adminClient.from('messages').delete().eq('user_id', userId);

    // 3. Remove from all room participants
    await adminClient.from('room_participants').delete().eq('user_id', userId);

    // 4. Delete rooms they host (cascading will remove participants + messages)
    await adminClient.from('rooms').delete().eq('host_id', userId);

    // 5. Delete profile
    await adminClient.from('profiles').delete().eq('id', userId);

    // 6. Delete the auth user record
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError.message);
      return NextResponse.json(
        { error: 'Failed to delete account. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Account deletion error:', err);
    return NextResponse.json(
      { error: 'Internal server error during account deletion.' },
      { status: 500 }
    );
  }
}
