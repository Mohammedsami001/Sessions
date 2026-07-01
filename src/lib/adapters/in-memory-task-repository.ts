import type { ITaskRepository } from '../ports';
import type { Task } from '../types';

export class InMemoryTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();
  private nextId = 1;

  async fetchTasks(roomId: string | null): Promise<Task[]> {
    const allTasks = Array.from(this.tasks.values());
    if (roomId) {
      return allTasks.filter(t => t.room_id === roomId).sort((a, b) => a.created_at.localeCompare(b.created_at));
    }
    return allTasks.filter(t => t.room_id === null).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  async createTask(text: string, userId: string, roomId: string | null): Promise<Task | null> {
    if (!text.trim() || !userId) return null;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      user_id: userId,
      room_id: roomId,
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

  async deleteTask(taskId: string): Promise<boolean> {
    return this.tasks.delete(taskId);
  }
}
