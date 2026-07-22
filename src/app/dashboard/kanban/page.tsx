import React from 'react';
import KanbanBoard from '@/components/ui/kanban/kanban-board';
import KanbanColumn from '@/components/ui/kanban/kanban-column';
import KanbanCard from '@/components/ui/kanban/kanban-card';

export default function KanbanPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
      
      {/* Page Header */}
      <header className="flex items-center justify-between p-6 pb-4 shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">Private Workspace</span>
            <span className="text-zinc-700 text-xs">•</span>
            <span className="text-zinc-500 text-xs">Template</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Everyday Tasks Template</h1>
        </div>
      </header>

      {/* Board Area */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard>
          
          <KanbanColumn id="col-1" title="To Do">
            <KanbanCard 
              id="t1" 
              title="Read Chapter 5" 
              tags={['Study']} 
              dueDate="Today" 
            />
            <KanbanCard 
              id="t2" 
              title="Draft essay outline" 
              tags={['Writing', 'High Priority']} 
            />
          </KanbanColumn>
          
          <KanbanColumn id="col-2" title="In Progress">
            <KanbanCard 
              id="t3" 
              title="Review lecture notes" 
              tags={['Study']} 
            />
          </KanbanColumn>
          
          <KanbanColumn id="col-3" title="Done">
            <KanbanCard 
              id="t4" 
              title="Submit assignment 1" 
              tags={['Submission']} 
              dueDate="Yesterday" 
            />
          </KanbanColumn>
          
        </KanbanBoard>
      </div>

    </div>
  );
}
