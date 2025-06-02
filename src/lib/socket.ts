import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, SocketChatMessage, ChatRoom } from '@/types/chat';
import { ChatMessage } from '@/types/openai';
import { createChatCompletion, summarizeConversation } from '@/utils/openai';

const handleAIResponse = async (roomId: string, rooms: { [key: string]: ChatRoom }, io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) => {
  try {
    // Summarize conversation if there are more than 10 messages
    const summaryMessages = rooms[roomId].messages.length > 10
      ? await summarizeConversation(rooms[roomId].messages)
      : [] as ChatMessage[];
    
    const socketMessages: SocketChatMessage[] = summaryMessages.length > 0
      ? summaryMessages.map(msg => ({
        id: Math.random().toString(36).substring(7),
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      } as SocketChatMessage))
      : rooms[roomId].messages;

    // Convert room messages to the format expected by createChatCompletion
    let chatMessages: ChatMessage[] = socketMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Get AI response
    const completion = await createChatCompletion(chatMessages);
    const aiResponse = completion.choices[0].message.content || 'Sorry, I could not generate a response.';

    const assistantMessage: SocketChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    rooms[roomId].messages.push(assistantMessage);
    io.to(roomId).emit('message', assistantMessage);
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Send error message to client
    const errorMessage: SocketChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: 'Sorry, I encountered an error while processing your message.',
      timestamp: new Date(),
    };
    rooms[roomId].messages.push(errorMessage);
    io.to(roomId).emit('message', errorMessage);
  }
};

export const initSocket = (server: NetServer) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const rooms: { [key: string]: ChatRoom } = {};

  io.on('connection', (socket) => {
    console.info('Client connected', socket.id);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.info('Client', socket.id, 'joined room', roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {
          id: roomId,
          messages: [{
            id: Math.random().toString(36).substring(7),
            role: 'system',
            content: 'Chatbot for developers',
            timestamp: new Date()
          }]
        };
      }
      socket.emit('messages', rooms[roomId].messages);
    });

    socket.on('message', async (message) => {
      const roomId = Array.from(socket.rooms)[1]; // Get the room ID (first room is socket's own room)
      if (!roomId) return;

      const newMessage: SocketChatMessage = {
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

      await handleAIResponse(roomId, rooms, io);
    });

    socket.on('disconnect', () => {
      console.info('Client disconnected');
    });
  });

  return io;
}; 