'use client';

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

export const Chat = () => {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const { messages, sendMessage } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      sendMessage(message, username);
      setMessage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div className="h-96 overflow-y-auto border rounded p-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.sender === username
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100'
            } max-w-[80%]`}
          >
            <div className="font-bold">{msg.sender}</div>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}; 