import { supabase } from '../supabase';
import type { ITaskRepository } from '../ports';
import type { Task } from '../types';

export class SupabaseTaskRepository implements ITaskRepository {
  async fetchTasks(roomId: string | null, scope?: 'global' | 'room'): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (roomId !== undefined) {
      if (roomId) {
        query = query.eq('room_id', roomId);
      } else {
        query = query.is('room_id', null);
      }
    }
    if (scope) {
      query = query.eq('scope', scope);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch tasks:', error.message);
      return [];
    }
    return data || [];
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'completed'>): Promise<Task | null> {
    if (!taskData.text?.trim() || !taskData.user_id) return null;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        text: taskData.text.trim(),
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create task:', error.message);
      return null;
    }
    return data;
  }

  async toggleTask(taskId: string, completed: boolean): Promise<boolean> {
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

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task:', error.message);
      return false;
    }
    return true;
  }

  async deleteTask(taskId: string): Promise<boolean> {
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
}
