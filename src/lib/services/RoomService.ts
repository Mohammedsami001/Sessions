import type { IRoomRepository } from '../ports';
import type { Room, RoomParticipant, CreateRoomInput } from '../types';

export class RoomService {
  constructor(private repo: IRoomRepository) {}

  async fetchPublicRooms(): Promise<Room[]> {
    return this.repo.fetchPublicRooms();
  }

  async fetchRoom(roomId: string): Promise<Room | null> {
    return this.repo.fetchRoom(roomId);
  }

  async fetchRoomByCode(code: string): Promise<Room | null> {
    return this.repo.fetchRoomByCode(code);
  }

  async createRoom(input: CreateRoomInput, userId: string): Promise<Room | null> {
    return this.repo.createRoom(input, userId);
  }

  async joinRoom(roomId: string, userId: string): Promise<RoomParticipant | null> {
    return this.repo.joinRoom(roomId, userId);
  }
  
  async joinRoomByCode(code: string, userId: string): Promise<{ room: Room | null; error?: string }> {
    const room = await this.fetchRoomByCode(code);
    if (!room) return { room: null, error: "Invalid room code. Please check and try again." };
    
    const p = await this.joinRoom(room.id, userId);
    if (!p) return { room: null, error: "Failed to join room." };
    
    return { room };
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    return this.repo.leaveRoom(roomId, userId);
  }

  async deleteRoom(roomId: string, userId: string): Promise<boolean> {
    return this.repo.deleteRoom(roomId, userId);
  }

  async fetchParticipants(roomId: string): Promise<any[]> {
    return this.repo.fetchParticipants(roomId);
  }

  async fetchParticipantCounts(roomIds: string[]): Promise<Record<string, number>> {
    return this.repo.fetchParticipantCounts(roomIds);
  }

  async startTimer(roomId: string, mode: "focus" | "break" | "long_break"): Promise<boolean> {
    return this.repo.startTimer(roomId, mode);
  }

  async pauseTimer(roomId: string): Promise<boolean> {
    return this.repo.pauseTimer(roomId);
  }

  async resetTimer(roomId: string): Promise<boolean> {
    return this.repo.resetTimer(roomId);
  }

  async completeTimerCycle(roomId: string, nextMode: "break" | "long_break"): Promise<boolean> {
    return this.repo.completeTimerCycle(roomId, nextMode);
  }

  async switchTimerMode(roomId: string, newMode: "focus" | "break" | "long_break"): Promise<boolean> {
    return this.repo.switchTimerMode(roomId, newMode);
  }

  subscribeToRoom(roomId: string, callback: (room: Room) => void): { unsubscribe: () => void } {
    return this.repo.subscribeToRoom(roomId, callback);
  }

  subscribeToParticipants(roomId: string, callback: () => void): { unsubscribe: () => void } {
    return this.repo.subscribeToParticipants(roomId, callback);
  }

  subscribeToPublicRooms(callback: () => void): { unsubscribe: () => void } {
    return this.repo.subscribeToPublicRooms(callback);
  }

  subscribeToPublicParticipants(callback: () => void): { unsubscribe: () => void } {
    return this.repo.subscribeToPublicParticipants(callback);
  }
}
