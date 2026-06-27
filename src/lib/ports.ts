import type { Profile, Task, MessageWithProfile, Room, RoomParticipant, CreateRoomInput } from './types';

export interface IProfileRepository {
  fetchProfile(userId: string): Promise<Profile | null>;
  createProfile(profile: Omit<Profile, 'created_at' | 'updated_at' | 'total_focus_seconds' | 'exp' | 'total_sessions' | 'streak_days' | 'last_active_date' | 'is_pro'>): Promise<Profile | null>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null>;
  deleteAccount(userId: string): Promise<boolean>;
}

export interface ITaskRepository {
  fetchTasks(roomId: string | null): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null>;
  toggleTask(taskId: string, completed: boolean): Promise<boolean>;
  deleteTask(taskId: string): Promise<boolean>;
}

export interface IChatRepository {
  fetchRecentMessages(roomId: string | null, limit?: number): Promise<MessageWithProfile[]>;
  sendMessage(content: string, userId: string, roomId: string | null): Promise<MessageWithProfile | null>;
  subscribeToMessages(roomId: string | null, callback: (msg: MessageWithProfile) => void): { unsubscribe: () => void };
}

export interface IRoomRepository {
  fetchPublicRooms(): Promise<Room[]>;
  fetchRoom(roomId: string): Promise<Room | null>;
  fetchRoomByCode(code: string): Promise<Room | null>;
  createRoom(input: CreateRoomInput, userId: string): Promise<Room | null>;
  joinRoom(roomId: string, userId: string): Promise<RoomParticipant | null>;
  leaveRoom(roomId: string, userId: string): Promise<boolean>;
  deleteRoom(roomId: string, userId: string): Promise<boolean>;
  fetchParticipants(roomId: string): Promise<any[]>;
  fetchParticipantCounts(roomIds: string[]): Promise<Record<string, number>>;
  
  // Timer controls
  startTimer(roomId: string, mode: "focus" | "break" | "long_break"): Promise<boolean>;
  pauseTimer(roomId: string): Promise<boolean>;
  resetTimer(roomId: string): Promise<boolean>;
  completeTimerCycle(roomId: string, nextMode: "break" | "long_break"): Promise<boolean>;
  switchTimerMode(roomId: string, newMode: "focus" | "break" | "long_break"): Promise<boolean>;

  // Subscriptions
  subscribeToRoom(roomId: string, callback: (room: Room) => void): { unsubscribe: () => void };
  subscribeToParticipants(roomId: string, callback: () => void): { unsubscribe: () => void };
  subscribeToPublicRooms(callback: () => void): { unsubscribe: () => void };
  subscribeToPublicParticipants(callback: () => void): { unsubscribe: () => void };
}
