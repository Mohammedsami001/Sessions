import React from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';

export interface KanbanColumnProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

export default function KanbanColumn({ id, title, children }: KanbanColumnProps) {
  const count = React.Children.count(children);

  return (
    <div className="flex flex-col w-[300px] shrink-0 bg-zinc-950/50 rounded-2xl border border-zinc-900/50 h-full max-h-full overflow-hidden">
      
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b border-zinc-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <span className="flex items-center justify-center bg-zinc-900 text-zinc-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]">
            {count}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors" title="Add item">
            <Plus size={16} />
          </button>
          <button className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-md transition-colors" title="More options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Column Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 hide-scrollbar">
        {children}
      </div>
      
    </div>
  );
}
