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

  async createTask(taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
    const task: Task = {
      ...taskData,
      id: `task-${this.nextId++}`,
      created_at: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
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
