import React from "react";
import { CheckSquare, Plus, Check, Trash2 } from "lucide-react";

export default function StudyChecklistWidget({ tasks, newTaskTitle, setNewTaskTitle, handleAddTask, toggleTaskCompletion, deleteTask }: any) {
  return (
    <div className="flex flex-col min-h-[340px] bg-white/5 border border-white/10 rounded-2xl relative group p-6 shadow-sm hover:border-white/20 transition-colors col-span-12 md:col-span-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
          <CheckSquare size={16} className="text-zinc-400" />
          Daily Study Checklist
        </h2>
        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
          {tasks.filter((t: any) => t.is_completed).length} / {tasks.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-32 opacity-50">
            <p className="text-xs text-zinc-500 font-semibold max-w-[200px]">No active objectives. Define your next target.</p>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div 
              key={task.id} 
              className={`group/task flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${task.is_completed ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/10 border-white/10 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button 
                  onClick={() => toggleTaskCompletion(task.id, task.is_completed)} 
                  className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 transition-colors ${task.is_completed ? 'bg-white border-white text-zinc-950' : 'bg-transparent border-white/30 hover:border-white/60'}`}
                >
                  {task.is_completed && <Check size={12} strokeWidth={4} />}
                </button>
                <span className={`text-sm font-medium truncate ${task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                  {task.title}
                </span>
              </div>
              
              <button 
                onClick={() => deleteTask(task.id)} 
                className="opacity-0 group-hover/task:opacity-100 text-zinc-600 hover:text-red-400 p-1.5 rounded transition-all shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddTask} className="flex items-center gap-2 mt-auto">
        <input 
          type="text" 
          placeholder="ADD NEW OBJECTIVE..." 
          value={newTaskTitle} 
          onChange={e => setNewTaskTitle(e.target.value)} 
          className="flex-1 bg-transparent border border-white/10 focus:border-white/30 px-4 py-3 rounded-lg text-white text-xs font-medium placeholder:text-zinc-600 placeholder:tracking-widest uppercase outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={!newTaskTitle?.trim()}
          className="p-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center justify-center shrink-0"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}
