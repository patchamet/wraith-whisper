import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, ChatMessage, ChatRoom } from '@/types/chat';

export const initSocket = (server: NetServer) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const rooms: { [key: string]: ChatRoom } = {};

  io.on('connection', (socket) => {
    console.log('Client connected', socket.id);
    
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log('Client', socket.id, 'joined room', roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          messages: []
        };
      }
      socket.emit('messages', rooms[roomId].messages);
    });

    socket.on('message', (message) => {
      const roomId = Array.from(socket.rooms)[1]; // Get the room ID (first room is socket's own room)
      if (!roomId) return;

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'user',
        content: message.content,
        timestamp: new Date(),
      };

      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          messages: []
        };
      }
      rooms[roomId].messages.push(newMessage);
      io.to(roomId).emit('message', newMessage);
      
      // Send confirmation message back to the client after delay
      setTimeout(() => {
        const confirmationMessage: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: `Received - ${newMessage.content}`,
          timestamp: new Date(),
        };
        rooms[roomId].messages.push(confirmationMessage);
        io.to(roomId).emit('message', confirmationMessage);
      }, 1000); // 1 second delay
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}; 