import { supabase } from './supabase';
import type { Task } from './types';

// ---------- Fetch Tasks ----------

export async function fetchTasks(roomId: string | null = null): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (roomId) {
    query = query.eq('room_id', roomId);
  } else {
    query = query.is('room_id', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch tasks:', error.message);
    return [];
  }
  return data || [];
}

// ---------- Create Task ----------

export async function createTask(
  text: string,
  roomId: string | null = null
): Promise<Task | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      text: text.trim(),
      room_id: roomId,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create task:', error.message);
    return null;
  }
  return data;
}

// ---------- Toggle Task ----------

export async function toggleTask(taskId: string, completed: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId);

  if (error) {
    console.error('Failed to toggle task:', error.message);
    return false;
  }
  return true;
}

// ---------- Delete Task ----------

export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Failed to delete task:', error.message);
    return false;
  }
  return true;
}
