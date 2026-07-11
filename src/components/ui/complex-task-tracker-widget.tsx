import React, { useState } from 'react';
import type { Task } from '../../lib/types';

interface ComplexTaskTrackerWidgetProps {
  tasks: Task[];
  currentRoomId: string | null;
  onAddTask: (task: Partial<Task>) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export default function ComplexTaskTrackerWidget({
  tasks,
  currentRoomId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask
}: ComplexTaskTrackerWidgetProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'room'>('global');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isPrioritySelectOpen, setIsPrioritySelectOpen] = useState(false);

  const filteredTasks = tasks.filter(t => t.scope === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    onAddTask({
      text: newTaskText,
      scope: activeTab,
      priority: newTaskPriority,
    });
    setNewTaskText('');
    setNewTaskPriority('medium');
    setIsPrioritySelectOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-sm hover:border-white/20 transition-colors" data-testid="complex-task-tracker-widget">
      <div className="pb-3 border-b border-white/10 p-5">
        <div className="flex gap-4">
          <button 
            className={`text-sm font-bold tracking-wide uppercase pb-2 transition-colors ${activeTab === 'global' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => setActiveTab('global')}
          >
            Global Tasks
          </button>
          <button 
            className={`text-sm font-bold tracking-wide uppercase pb-2 transition-colors ${activeTab === 'room' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            onClick={() => setActiveTab('room')}
            disabled={!currentRoomId && tasks.filter(t => t.scope === 'room').length === 0}
          >
            Room Tasks
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <form onSubmit={handleSubmit} data-testid="add-task-form" className="flex gap-2 relative">
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 placeholder:text-zinc-600 transition-colors"
          />
          <button 
            type="button" 
            aria-label="Set Priority"
            onClick={() => setIsPrioritySelectOpen(!isPrioritySelectOpen)}
            className="bg-white/5 border border-white/10 text-zinc-300 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            {newTaskPriority === 'high' ? '🔴' : newTaskPriority === 'medium' ? '🟡' : '🟢'}
          </button>
          
          {isPrioritySelectOpen && (
            <div className="absolute right-[60px] top-12 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-1 z-10 w-24">
              <button type="button" onClick={() => { setNewTaskPriority('high'); setIsPrioritySelectOpen(false); }} className="w-full text-left px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded-md transition-colors">High</button>
              <button type="button" onClick={() => { setNewTaskPriority('medium'); setIsPrioritySelectOpen(false); }} className="w-full text-left px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded-md transition-colors">Medium</button>
              <button type="button" onClick={() => { setNewTaskPriority('low'); setIsPrioritySelectOpen(false); }} className="w-full text-left px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded-md transition-colors">Low</button>
            </div>
          )}
          
          <button type="submit" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-colors">
            Add
          </button>
        </form>

        <div className="space-y-2 mt-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm font-medium">
              No tasks here yet. Add one above!
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={(e) => onToggleTask(task.id, e.target.checked)}
                  className="mt-1 w-4 h-4 rounded-sm border-white/20 bg-black/20 checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:text-black checked:after:absolute checked:after:text-[10px] checked:after:font-bold checked:after:left-[3px] checked:after:-top-[1px]"
                />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm block truncate ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                    {task.text}
                  </span>
                  {(task.tags?.length || task.dueDate || task.priority) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.priority === 'high' && <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">High</span>}
                      {task.priority === 'medium' && <span className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Medium</span>}
                      {task.priority === 'low' && <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Low</span>}
                      {task.tags?.map(tag => (
                        <span key={tag} className="text-[10px] bg-white/5 border border-white/10 text-zinc-400 font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
