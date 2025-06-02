export interface SocketChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  messages: SocketChatMessage[];
}

export interface ServerToClientEvents {
  message: (message: SocketChatMessage) => void;
  messages: (messages: SocketChatMessage[]) => void;
}

export interface ClientToServerEvents {
  message: (message: Omit<SocketChatMessage, 'id' | 'timestamp'>) => void;
  join_room: (roomId: string) => void;
} 