import type { ITaskRepository } from '../ports';
import type { Task } from '../types';

export class TaskService {
  constructor(private repo: ITaskRepository) {}

  async fetchTasks(roomId: string | null): Promise<Task[]> {
    return this.repo.fetchTasks(roomId);
  }

  async createTask(text: string, userId: string, roomId: string | null = null): Promise<Task | null> {
    if (!text.trim() || !userId) return null;
    return this.repo.createTask({
      text: text.trim(),
      user_id: userId,
      room_id: roomId,
      completed: false,
    });
  }

  async toggleTask(taskId: string, completed: boolean): Promise<boolean> {
    return this.repo.toggleTask(taskId, completed);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return this.repo.deleteTask(taskId);
  }
}
