import type { IRoomRepository } from '../ports';
import type { Room, RoomParticipant, CreateRoomInput } from '../types';

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms: Map<string, Room> = new Map();
  private participants: Map<string, RoomParticipant> = new Map(); // key: roomId_userId
  
  private roomSubs: Array<{ roomId: string; cb: (r: Room) => void }> = [];
  private partSubs: Array<{ roomId: string; cb: () => void }> = [];
  private publicRoomSubs: Array<() => void> = [];
  private publicPartSubs: Array<() => void> = [];

  private generateId() {
    return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private notifyRoomSubs(room: Room) {
    this.roomSubs.forEach(sub => {
      if (sub.roomId === room.id) sub.cb(room);
    });
    if (room.visibility === 'public') {
      this.publicRoomSubs.forEach(cb => cb());
    }
  }
  
  private notifyPartSubs(roomId: string) {
    this.partSubs.forEach(sub => {
      if (sub.roomId === roomId) sub.cb();
    });
    this.publicPartSubs.forEach(cb => cb());
  }

  async fetchPublicRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values())
      .filter(r => r.visibility === 'public')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async fetchRoom(roomId: string): Promise<Room | null> {
    return this.rooms.get(roomId) || null;
  }

  async fetchRoomByCode(code: string): Promise<Room | null> {
    const arr = Array.from(this.rooms.values());
    return arr.find(r => r.join_code === code.toUpperCase().trim()) || null;
  }

  async createRoom(input: CreateRoomInput, userId: string): Promise<Room | null> {
    const id = this.generateId();
    const join_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: Room = {
      id,
      title: input.title,
      category: input.category,
      visibility: input.visibility,
      focus_duration: input.focus_duration || 1500,
      break_duration: input.break_duration || 300,
      long_break_duration: input.long_break_duration || 900,
      long_break_interval: input.long_break_interval || 4,
      host_id: userId,
      join_code,
      timer_status: 'idle',
      timer_started_at: null,
      cycles_completed: 0,
      created_at: new Date().toISOString()
    };
    this.rooms.set(id, room);
    await this.joinRoom(id, userId);
    this.notifyRoomSubs(room);
    return room;
  }

  async joinRoom(roomId: string, userId: string): Promise<RoomParticipant | null> {
    if (!this.rooms.has(roomId)) return null;
    const key = `${roomId}_${userId}`;
    const p: any = {
      id: crypto.randomUUID(),
      room_id: roomId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      profiles: { display_name: 'Test', avatar_url: null }
    };
    this.participants.set(key, p);
    this.notifyPartSubs(roomId);
    return p;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const key = `${roomId}_${userId}`;
    if (!this.participants.has(key)) return false;
    this.participants.delete(key);
    
    const room = this.rooms.get(roomId);
    if (room && room.host_id === userId) {
      // Find oldest participant
      const parts = Array.from(this.participants.values())
        .filter(p => p.room_id === roomId)
        .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
      
      if (parts.length > 0) {
        room.host_id = parts[0].user_id;
        this.notifyRoomSubs(room);
      } else {
        this.rooms.delete(roomId);
        if (room.visibility === 'public') {
          this.publicRoomSubs.forEach(cb => cb());
        }
      }
    }
    
    this.notifyPartSubs(roomId);
    return true;
  }

  async deleteRoom(roomId: string, userId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room || room.host_id !== userId) return false;
    
    // Remove parts
    for (const [key, val] of this.participants.entries()) {
      if (val.room_id === roomId) this.participants.delete(key);
    }
    this.rooms.delete(roomId);
    
    this.notifyPartSubs(roomId);
    if (room.visibility === 'public') {
      this.publicRoomSubs.forEach(cb => cb());
    }
    return true;
  }

  async fetchParticipants(roomId: string): Promise<any[]> {
    return Array.from(this.participants.values())
      .filter(p => p.room_id === roomId)
      .sort((a, b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());
  }

  async fetchParticipantCounts(roomIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    for (const id of roomIds) {
      counts[id] = Array.from(this.participants.values()).filter(p => p.room_id === id).length;
    }
    return counts;
  }

  async startTimer(roomId: string, mode: "focus" | "break" | "long_break"): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    let timerStartedAt = new Date().toISOString();
    if (room.timer_status === "idle" && room.timer_started_at) {
      const elapsed = Math.floor((Date.now() - new Date(room.timer_started_at).getTime()) / 1000);
      timerStartedAt = new Date(Date.now() - elapsed * 1000).toISOString();
    }
    
    room.timer_status = mode;
    room.timer_started_at = timerStartedAt;
    this.notifyRoomSubs(room);
    return true;
  }

  async pauseTimer(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.timer_status = 'idle';
    this.notifyRoomSubs(room);
    return true;
  }

  async resetTimer(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.timer_status = 'idle';
    room.timer_started_at = null;
    room.cycles_completed = 0;
    this.notifyRoomSubs(room);
    return true;
  }

  async completeTimerCycle(roomId: string, nextMode: "break" | "long_break"): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.cycles_completed = (room.cycles_completed || 0) + 1;
    room.timer_status = nextMode;
    room.timer_started_at = new Date().toISOString();
    this.notifyRoomSubs(room);
    return true;
  }

  async switchTimerMode(roomId: string, newMode: "focus" | "break" | "long_break"): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.timer_status = newMode;
    room.timer_started_at = null;
    this.notifyRoomSubs(room);
    return true;
  }

  subscribeToRoom(roomId: string, callback: (room: Room) => void) {
    const sub = { roomId, cb: callback };
    this.roomSubs.push(sub);
    return { unsubscribe: () => { this.roomSubs = this.roomSubs.filter(s => s !== sub); } };
  }

  subscribeToParticipants(roomId: string, callback: () => void) {
    const sub = { roomId, cb: callback };
    this.partSubs.push(sub);
    return { unsubscribe: () => { this.partSubs = this.partSubs.filter(s => s !== sub); } };
  }

  subscribeToPublicRooms(callback: () => void) {
    this.publicRoomSubs.push(callback);
    return { unsubscribe: () => { this.publicRoomSubs = this.publicRoomSubs.filter(c => c !== callback); } };
  }

  subscribeToPublicParticipants(callback: () => void) {
    this.publicPartSubs.push(callback);
    return { unsubscribe: () => { this.publicPartSubs = this.publicPartSubs.filter(c => c !== callback); } };
  }
}
