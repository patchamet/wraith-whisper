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

  const roomMessages: { [key: string]: ChatMessage[] } = {};

  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
      }
      socket.emit('messages', roomMessages[roomId]);
    });

    socket.on('message', (message) => {
      const roomId = Array.from(socket.rooms)[1]; // Get the room ID (first room is socket's own room)
      if (!roomId) return;

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        content: message.content,
        sender: message.sender,
        timestamp: new Date(),
      };

      if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
      }
      roomMessages[roomId].push(newMessage);
      io.to(roomId).emit('message', newMessage);
      
      // Send confirmation message back to the client
      const confirmationMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        content: `Received - ${newMessage.content}`,
        sender: "System",
        timestamp: new Date(),
      };
      roomMessages[roomId].push(confirmationMessage);
      io.to(roomId).emit('message', confirmationMessage);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}; 