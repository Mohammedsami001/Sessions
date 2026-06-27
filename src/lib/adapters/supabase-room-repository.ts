import { supabase } from '../supabase';
import type { IRoomRepository } from '../ports';
import type { Room, RoomParticipant, CreateRoomInput } from '../types';

export class SupabaseRoomRepository implements IRoomRepository {
  async fetchPublicRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch rooms:', error.message);
      return [];
    }
    return data || [];
  }

  async fetchRoom(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    if (error) {
      console.error('Failed to fetch room:', error.message);
      return null;
    }
    return data;
  }

  async fetchRoomByCode(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('join_code', code.toUpperCase().trim())
      .single();
    if (error) {
      console.error('Failed to fetch room by code:', error.message);
      return null;
    }
    return data;
  }

  async createRoom(input: CreateRoomInput, userId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        title: input.title,
        category: input.category,
        host_id: userId,
        visibility: input.visibility,
        focus_duration: input.focus_duration || 1500,
        break_duration: input.break_duration || 300,
        long_break_duration: input.long_break_duration || 900,
        long_break_interval: input.long_break_interval || 4,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create room:', error.message);
      return null;
    }

    if (data) {
      await this.joinRoom(data.id, userId);
    }
    return data;
  }

  async joinRoom(roomId: string, userId: string): Promise<RoomParticipant | null> {
    const { data, error } = await supabase
      .from('room_participants')
      .upsert(
        { room_id: roomId, user_id: userId },
        { onConflict: 'room_id,user_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Failed to join room:', error.message);
      return null;
    }
    return data;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const { data: room } = await supabase
      .from('rooms')
      .select('host_id')
      .eq('id', roomId)
      .single();

    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to leave room:', error.message);
      return false;
    }

    if (room?.host_id === userId) {
      const { data: nextHost } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true })
        .limit(1)
        .single();

      if (nextHost) {
        await supabase
          .from('rooms')
          .update({ host_id: nextHost.user_id })
          .eq('id', roomId);
      } else {
        await supabase.from('rooms').delete().eq('id', roomId);
      }
    }
    return true;
  }

  async deleteRoom(roomId: string, userId: string): Promise<boolean> {
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select('host_id')
      .eq('id', roomId)
      .single();

    if (fetchError || !room || room.host_id !== userId) {
      console.error('Only the host can delete a room');
      return false;
    }

    const { error: partError } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId);

    if (partError) {
      console.error('Failed to remove participants:', partError.message);
      return false;
    }

    const { error: roomError } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (roomError) {
      console.error('Failed to delete room:', roomError.message);
      return false;
    }
    return true;
  }

  async fetchParticipants(roomId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*, profiles(display_name, avatar_url)')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch participants:', error.message);
      return [];
    }
    return data || [];
  }

  async fetchParticipantCounts(roomIds: string[]): Promise<Record<string, number>> {
    if (roomIds.length === 0) return {};
    const { data, error } = await supabase
      .from('room_participants')
      .select('room_id')
      .in('room_id', roomIds);

    if (error) {
      console.error('Failed to fetch participant counts:', error.message);
      return {};
    }

    const counts: Record<string, number> = {};
    (data || []).forEach((row) => {
      counts[row.room_id] = (counts[row.room_id] || 0) + 1;
    });
    return counts;
  }

  async startTimer(roomId: string, mode: "focus" | "break" | "long_break"): Promise<boolean> {
    const { data: room } = await supabase
      .from('rooms')
      .select('timer_started_at, timer_status')
      .eq('id', roomId)
      .single();

    let timerStartedAt: string;
    if (room?.timer_status === 'idle' && room?.timer_started_at) {
      const elapsed = Math.floor((Date.now() - new Date(room.timer_started_at).getTime()) / 1000);
      timerStartedAt = new Date(Date.now() - elapsed * 1000).toISOString();
    } else {
      timerStartedAt = new Date().toISOString();
    }

    const { error } = await supabase
      .from('rooms')
      .update({
        timer_status: mode,
        timer_started_at: timerStartedAt,
      })
      .eq('id', roomId);

    if (error) {
      console.error('Failed to start timer:', error.message);
      return false;
    }
    return true;
  }

  async pauseTimer(roomId: string): Promise<boolean> {
    const { error } = await supabase
      .from('rooms')
      .update({ timer_status: 'idle' })
      .eq('id', roomId);
    
    if (error) {
      console.error('Failed to pause timer:', error.message);
      return false;
    }
    return true;
  }

  async resetTimer(roomId: string): Promise<boolean> {
    const { error } = await supabase
      .from('rooms')
      .update({
        timer_status: 'idle',
        timer_started_at: null,
        cycles_completed: 0,
      })
      .eq('id', roomId);

    if (error) {
      console.error('Failed to reset timer:', error.message);
      return false;
    }
    return true;
  }

  async completeTimerCycle(roomId: string, nextMode: "break" | "long_break"): Promise<boolean> {
    const { data: room } = await supabase
      .from('rooms')
      .select('cycles_completed')
      .eq('id', roomId)
      .single();

    const newCycles = (room?.cycles_completed || 0) + 1;
    const { error } = await supabase
      .from('rooms')
      .update({
        timer_status: nextMode,
        timer_started_at: new Date().toISOString(),
        cycles_completed: newCycles,
      })
      .eq('id', roomId);

    if (error) {
      console.error('Failed to complete cycle:', error.message);
      return false;
    }
    return true;
  }

  async switchTimerMode(roomId: string, newMode: "focus" | "break" | "long_break"): Promise<boolean> {
    const { error } = await supabase
      .from('rooms')
      .update({
        timer_status: newMode,
        timer_started_at: null,
      })
      .eq('id', roomId);

    if (error) {
      console.error('Failed to switch timer mode:', error.message);
      return false;
    }
    return true;
  }

  subscribeToRoom(roomId: string, callback: (room: Room) => void): { unsubscribe: () => void } {
    const sub = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => callback(payload.new as Room)
      )
      .subscribe();
    return { unsubscribe: () => { supabase.removeChannel(sub); } };
  }

  subscribeToParticipants(roomId: string, callback: () => void): { unsubscribe: () => void } {
    const sub = supabase
      .channel(`participants-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
        () => callback()
      )
      .subscribe();
    return { unsubscribe: () => { supabase.removeChannel(sub); } };
  }

  subscribeToPublicRooms(callback: () => void): { unsubscribe: () => void } {
    const sub = supabase
      .channel('public-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => callback()
      )
      .subscribe();
    return { unsubscribe: () => { supabase.removeChannel(sub); } };
  }

  subscribeToPublicParticipants(callback: () => void): { unsubscribe: () => void } {
    const sub = supabase
      .channel('public-participants')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_participants' },
        () => callback()
      )
      .subscribe();
    return { unsubscribe: () => { supabase.removeChannel(sub); } };
  }
}
