import type { ITaskRepository } from '../ports';
import type { Task } from '../types';

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();
  private nextId = 1;

  async fetchTasks(roomId: string | null, scope?: 'global' | 'room'): Promise<Task[]> {
    let allTasks = Array.from(this.tasks.values());
    if (roomId !== undefined) {
      allTasks = allTasks.filter(t => t.room_id === roomId);
    }
    if (scope) {
      allTasks = allTasks.filter(t => t.scope === scope);
    }
    return allTasks.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'completed'>): Promise<Task | null> {
    if (!taskData.text?.trim() || !taskData.user_id) return null;
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      text: taskData.text.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    this.tasks.set(newTask.id, newTask);
    return newTask;
  }

  async toggleTask(taskId: string, completed: boolean): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.completed = completed;
    return true;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    Object.assign(task, updates);
    return true;
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return this.tasks.delete(taskId);
  }
}
