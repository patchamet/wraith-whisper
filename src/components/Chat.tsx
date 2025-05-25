'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useSearchParams } from 'next/navigation';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || 'default';
  const { messages, sendMessage } = useSocket(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  useEffect(() => {
    // Check if the last message is from the system
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'System') {
      setIsLoading(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setIsLoading(true);
      sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="h-140 w-4xl overflow-y-auto border rounded p-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.sender === 'System'
                ? 'ml-0 bg-zinc-900 max-w-[100%]' 
                : 'ml-auto bg-slate-900 max-w-[60%]'
            }`}
          >
            <div className="font-bold">{msg.sender}</div>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-4xl">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isLoading ? "Waiting for response..." : "Type a message..."}
          disabled={isLoading}
          className={`flex-1 p-2 border rounded ${
            isLoading ? 'bg-zinc-900 cursor-not-allowed' : ''
          }`}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}; 