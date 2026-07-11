import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTaskRepository } from '../../lib/adapters/in-memory-task-repository';
import type { Task } from '../../lib/types';

describe('InMemoryTaskRepository', () => {
  let repo: InMemoryTaskRepository;

  beforeEach(() => {
    repo = new InMemoryTaskRepository();
  });

  it('supports creating and fetching complex tasks with scope and subtasks', async () => {
    const newTask = await repo.createTask({
      user_id: 'user1',
      room_id: null,
      scope: 'global',
      text: 'Finish PRD',
      priority: 'high',
      tags: ['planning'],
      dueDate: '2023-10-31T00:00:00.000Z',
      subTasks: [{ id: 'sub1', text: 'Write user stories', completed: false }]
    });

    expect(newTask).not.toBeNull();
    expect(newTask?.id).toBeDefined();
    expect(newTask?.scope).toBe('global');
    expect(newTask?.priority).toBe('high');
    expect(newTask?.tags).toContain('planning');
    expect(newTask?.subTasks).toHaveLength(1);

    const tasks = await repo.fetchTasks(null, 'global');
    expect(tasks).toHaveLength(1);
    expect(tasks[0].text).toBe('Finish PRD');
  });

  it('supports updating task properties', async () => {
    const task = await repo.createTask({
      user_id: 'user1',
      room_id: null,
      scope: 'global',
      text: 'Original text'
    });

    expect(task).not.toBeNull();
    
    await repo.updateTask(task!.id, { priority: 'medium', tags: ['updated'] });
    const tasks = await repo.fetchTasks(null);
    expect(tasks[0].priority).toBe('medium');
    expect(tasks[0].tags).toEqual(['updated']);
  });
});
