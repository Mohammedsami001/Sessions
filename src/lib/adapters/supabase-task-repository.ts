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
    
    // Map db columns to frontend types
    return (data || []).map((t: Record<string, unknown>) => ({
      ...(t as Record<string, unknown>),
      dueDate: t.due_date,
      subTasks: t.sub_tasks
    })) as Task[];
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'completed'>): Promise<Task | null> {
    if (!taskData.text?.trim() || !taskData.user_id) return null;
    const { dueDate, subTasks, ...restTaskData } = taskData;
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...restTaskData,
        text: taskData.text.trim(),
        completed: false,
        scope: taskData.scope || 'global',
        priority: taskData.priority || null,
        due_date: taskData.dueDate || null,
        tags: taskData.tags || [],
        sub_tasks: taskData.subTasks || []
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create task:', error.message);
      return null;
    }
    
    // Map db columns back to frontend camelCase
    return {
      ...data,
      dueDate: data.due_date,
      subTasks: data.sub_tasks
    } as Task;
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
    const dbUpdates: Record<string, unknown> = { ...updates };
    if ('dueDate' in updates) {
      dbUpdates.due_date = updates.dueDate;
      delete dbUpdates.dueDate;
    }
    if ('subTasks' in updates) {
      dbUpdates.sub_tasks = updates.subTasks;
      delete dbUpdates.subTasks;
    }

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
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
