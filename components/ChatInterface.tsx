import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, onSendMessage, isSending }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-green-500 fill-green-500" />
            AI Nutritionist
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-1">Ask follow-up questions about this meal</p>
        </div>
        <div className="flex -space-x-2">
           {/* Visual avatar stack decoration */}
           <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 text-xs font-bold">AI</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Sparkles className="text-green-400 w-8 h-8" />
                </div>
                <p className="text-gray-900 font-semibold">Any questions?</p>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                    "Is this healthy?"<br/> "How can I make this lower calorie?"
                </p>
            </div>
        )}
        
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatars */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-green-100 text-green-600'
            }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-br-none'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isSending && (
           <div className="flex items-end gap-3">
             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
              <div className="flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full py-3.5 pl-5 pr-14 bg-gray-50 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:bg-white border border-gray-200 focus:border-green-500 transition-all placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="absolute right-2 p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md shadow-green-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;