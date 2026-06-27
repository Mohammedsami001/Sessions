import { SupabaseProfileRepository } from './adapters/supabase-profile-repository';
import { SupabaseTaskRepository } from './adapters/supabase-task-repository';
import { SupabaseChatRepository } from './adapters/supabase-chat-repository';
import { SupabaseRoomRepository } from './adapters/supabase-room-repository';
import { ProfileService } from './services/ProfileService';
import { TaskService } from './services/TaskService';
import { ChatService } from './services/ChatService';
import { RoomService } from './services/RoomService';

// Initialize Repositories
const profileRepository = new SupabaseProfileRepository();
const taskRepository = new SupabaseTaskRepository();
const chatRepository = new SupabaseChatRepository();
const roomRepository = new SupabaseRoomRepository();

// Initialize Services
export const profileService = new ProfileService(profileRepository);
export const taskService = new TaskService(taskRepository);
export const chatService = new ChatService(chatRepository);
export const roomService = new RoomService(roomRepository);
