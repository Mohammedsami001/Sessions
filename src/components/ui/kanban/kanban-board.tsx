import React from 'react';

export interface KanbanBoardProps {
  children?: React.ReactNode;
}

export default function KanbanBoard({ children }: KanbanBoardProps) {
  return (
    <div className="flex h-full w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory items-start gap-4 p-6 pt-0">
      {children}
      
      {/* Empty slot for adding new column */}
      <button className="flex items-center justify-center min-w-[300px] h-12 shrink-0 rounded-2xl border border-dashed border-zinc-900/80 bg-zinc-950/20 hover:bg-zinc-950/50 hover:border-zinc-800 text-zinc-500 hover:text-zinc-400 transition-colors snap-start text-sm font-medium">
        + Add Column
      </button>
    </div>
  );
}
