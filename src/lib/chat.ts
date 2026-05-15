import { supabase } from './supabase';
import type { Message, MessageWithProfile } from './types';

// ---------- Fetch Recent Messages ----------

export async function fetchRecentMessages(
  roomId: string | null,
  limit: number = 50
): Promise<MessageWithProfile[]> {
  let query = supabase
    .from('messages')
    .select('*, profiles(display_name, avatar_url)')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (roomId) {
    query = query.eq('room_id', roomId);
  } else {
    query = query.is('room_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch messages:', error.message);
    return [];
  }
  return (data as MessageWithProfile[]) || [];
}

// ---------- Send Message ----------

export async function sendMessage(
  content: string,
  roomId: string | null = null
): Promise<Message | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      content: content.trim(),
      room_id: roomId,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send message:', error.message);
    return null;
  }
  return data;
}

// ---------- Realtime Subscription ----------

export function subscribeToMessages(
  roomId: string | null,
  callback: () => void
) {
  const channelName = roomId ? `chat-room-${roomId}` : 'chat-global';

  const channel = supabase.channel(channelName).on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      ...(roomId ? { filter: `room_id=eq.${roomId}` } : {}),
    },
    () => callback()
  );

  return channel.subscribe();
}
