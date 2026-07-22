import React from 'react';
import { GripVertical, Clock } from 'lucide-react';

export interface KanbanCardProps {
  id: string;
  title: string;
  tags?: string[];
  dueDate?: string;
}

export default function KanbanCard({ id, title, tags, dueDate }: KanbanCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 p-3 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-white/10 hover:bg-zinc-800/50 transition-all cursor-grab active:cursor-grabbing">
      
      {/* Drag handle */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={14} className="text-zinc-500" />
      </div>

      <div className="pr-6">
        <h4 className="text-sm font-medium text-white leading-snug">
          {title}
        </h4>
      </div>
      
      {(tags || dueDate) && (
        <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
          {tags?.map((tag) => (
            <span 
              key={tag}
              className="px-2 py-0.5 rounded-md bg-zinc-950 border border-white/5 text-[10px] font-medium text-zinc-400"
            >
              {tag}
            </span>
          ))}
          
          {dueDate && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 ml-auto bg-zinc-950/50 px-2 py-0.5 rounded-md border border-white/5">
              <Clock size={10} />
              <span>{dueDate}</span>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
