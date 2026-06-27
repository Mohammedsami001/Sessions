import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTaskRepository } from '@/lib/adapters/in-memory-task-repository';
import { TaskService } from '@/lib/services/TaskService';

describe('TaskService', () => {
  let repo: InMemoryTaskRepository;
  let service: TaskService;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
    service = new TaskService(repo);
  });

  it('can create and fetch tasks for a room', async () => {
    await service.createTask('Test task', 'user-1', 'room-1');
    await service.createTask('Global task', 'user-1', null);

    const roomTasks = await service.fetchTasks('room-1');
    expect(roomTasks).toHaveLength(1);
    expect(roomTasks[0].text).toBe('Test task');
    
    const globalTasks = await service.fetchTasks(null);
    expect(globalTasks).toHaveLength(1);
    expect(globalTasks[0].text).toBe('Global task');
  });

  it('can toggle and delete tasks', async () => {
    const task = await service.createTask('To be toggled', 'user-1', null);
    expect(task).not.toBeNull();
    
    // Toggle
    let success = await service.toggleTask(task!.id, true);
    expect(success).toBe(true);
    let tasks = await service.fetchTasks(null);
    expect(tasks[0].completed).toBe(true);
    
    // Delete
    success = await service.deleteTask(task!.id);
    expect(success).toBe(true);
    tasks = await service.fetchTasks(null);
    expect(tasks).toHaveLength(0);
  });
});
