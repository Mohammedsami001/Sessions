import { SupabaseProfileRepository } from './adapters/supabase-profile-repository';
import { SupabaseTaskRepository } from './adapters/supabase-task-repository';
import { SupabaseChatRepository } from './adapters/supabase-chat-repository';
import { SupabaseRoomRepository } from './adapters/supabase-room-repository';
// Initialize Repositories
const profileRepository = new SupabaseProfileRepository();
const taskRepository = new SupabaseTaskRepository();
const chatRepository = new SupabaseChatRepository();
const roomRepository = new SupabaseRoomRepository();

// Export Repositories as services for backward compatibility in components
export const profileService = profileRepository;
export const taskService = taskRepository;
export const chatService = chatRepository;
export const roomService = roomRepository;
