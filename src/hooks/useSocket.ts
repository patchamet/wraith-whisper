'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, ChatMessage } from '@/types/chat';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketInstance.on('messages', (initialMessages) => {
      setMessages(initialMessages);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = (content: string, sender: string) => {
    if (socket) {
      socket.emit('message', { content, sender });
    }
  };

  return { messages, sendMessage };
}; 