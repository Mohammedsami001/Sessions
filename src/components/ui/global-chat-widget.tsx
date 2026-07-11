import React from "react";
import { MessageSquare, Send } from "lucide-react";

import type { MessageWithProfile } from "../../lib/types";

export default function GlobalChatWidget({
  chatMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  chatEndRef
}: {
  chatMessages: MessageWithProfile[],
  chatInput: string,
  setChatInput: React.Dispatch<React.SetStateAction<string>>,
  handleSendMessage: (e: React.FormEvent) => void,
  chatEndRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl relative group p-5 shadow-sm hover:border-white/20 transition-colors w-full flex-1 min-h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-extrabold flex items-center gap-2 text-white">
          <MessageSquare size={16} className="text-zinc-400" />
          Global Chat Stream
        </h2>
        <span className="w-2 h-2 rounded-full bg-white/80"></span>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 text-center">
            <MessageSquare size={24} className="text-zinc-500 mb-2" />
            <p className="text-xs text-zinc-500 font-semibold max-w-[200px]">Network is quiet. Send a message to the global stream.</p>
          </div>
        ) : (
          chatMessages.map((msg: any) => (
            <div key={msg.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-zinc-300">{msg.user_name}</span>
                <span className="text-[9px] text-zinc-600 font-medium">
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg rounded-tl-none text-sm text-zinc-300 w-fit">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-auto">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={chatInput} 
          onChange={e => setChatInput(e.target.value)} 
          className="flex-1 bg-transparent border border-white/10 focus:border-white/30 px-4 py-3 rounded-lg text-white text-sm font-medium placeholder:text-zinc-600 outline-none transition-all"
        />
        <button 
          type="submit" 
          disabled={!chatInput?.trim()}
          className="p-3 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors flex items-center justify-center shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
