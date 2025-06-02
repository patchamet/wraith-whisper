'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useSearchParams } from 'next/navigation';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId') || 'default';
  const { messages, sendMessage, currentRoom } = useSocket(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
    console.info('Messages updated:', messages);
  }, [messages]);

  useEffect(() => {
    // Check if the last message is from the Assistant
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      setIsLoading(false);
      console.info('Assistant message received, loading state set to false');
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.info('Sending message:', message);
      setIsLoading(true);
      sendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    console.info('Current room:', currentRoom);
  }, [currentRoom]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 p-2 w-4xl bg-slate-800 rounded text-center">
        <span className="text-sm text-gray-400">Room ID: </span>
        <span className="font-mono text-blue-400">{currentRoom?.id || roomId}</span>
      </div>
      <div className="h-140 w-4xl overflow-y-auto border rounded p-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${['system', 'assistant'].includes(msg.role)
                ? 'ml-0 bg-zinc-900 max-w-[100%]'
                : 'ml-auto bg-slate-900 max-w-[50%]'
              }`
            }
          >
            <div className="font-bold capitalize">{msg.role}</div>
            <div className="whitespace-pre-line">{msg.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 w-4xl">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
            placeholder={isLoading ? "Waiting for response..." : "Type a message..."}
            disabled={isLoading}
            maxLength={1000}
            className={`w-full p-2 border rounded resize-none min-h-[40px] max-h-[120px] ${isLoading ? 'bg-zinc-900 cursor-not-allowed' : ''}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {message.length}/1000
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded ${isLoading
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