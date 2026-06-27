import { supabase } from '../supabase';
import type { IChatRepository } from '../ports';
import type { MessageWithProfile } from '../types';

export class SupabaseChatRepository implements IChatRepository {
  async fetchRecentMessages(roomId: string | null, limit: number = 30): Promise<MessageWithProfile[]> {
    let query = supabase
      .from('messages')
      .select('*, profiles(display_name, avatar_url)')
      .order('created_at', { ascending: false })
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
    return (data || []).reverse();
  }

  async sendMessage(content: string, userId: string, roomId: string | null): Promise<MessageWithProfile | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: userId,
        room_id: roomId,
      })
      .select('*, profiles(display_name, avatar_url)')
      .single();

    if (error) {
      console.error('Failed to send message:', error.message);
      return null;
    }
    return data;
  }

  subscribeToMessages(roomId: string | null, callback: (msg: MessageWithProfile) => void): { unsubscribe: () => void } {
    const channelName = roomId ? `messages:room:${roomId}` : 'messages:global';
    
    let filterOptions: any = { event: 'INSERT', schema: 'public', table: 'messages' };
    if (roomId) {
      filterOptions.filter = `room_id=eq.${roomId}`;
    }

    const sub = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        filterOptions,
        async (payload) => {
          // fetch profile info
          const { data } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', (payload.new as any).user_id)
            .single();

          const messageWithProfile: MessageWithProfile = {
            id: (payload.new as any).id,
            room_id: (payload.new as any).room_id,
            user_id: (payload.new as any).user_id,
            content: (payload.new as any).content,
            created_at: (payload.new as any).created_at,
            profiles: {
              display_name: data?.display_name || 'Unknown',
              avatar_url: data?.avatar_url || null,
            }
          };
          
          callback(messageWithProfile);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(sub);
      }
    };
  }
}
