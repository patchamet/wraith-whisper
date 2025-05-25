import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, ChatMessage } from '@/types/chat';

export const initSocket = (server: NetServer) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const messages: ChatMessage[] = [];

  io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('messages', messages);

    socket.on('message', (message) => {
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        content: message.content,
        sender: message.sender,
        timestamp: new Date(),
      };
      messages.push(newMessage);
      io.emit('message', newMessage);
    });
  });

  return io;
}; 