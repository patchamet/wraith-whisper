'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, ChatMessage, ChatRoom } from '@/types/chat';

export const useSocket = (roomId: string) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      socketInstance.emit('join_room', roomId);
      setCurrentRoom({ id: roomId, messages: [] });
    });

    socketInstance.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
      setCurrentRoom((prev) => prev ? { ...prev, messages: [...prev.messages, message] } : null);
    });

    socketInstance.on('messages', (initialMessages) => {
      setMessages(initialMessages);
      setCurrentRoom((prev) => prev ? { ...prev, messages: initialMessages } : null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  const sendMessage = (content: string) => {
    if (socket) {
      socket.emit('message', { content, sender: 'Client', role: 'user' });
    }
  };

  return { messages, sendMessage, currentRoom };
}; 