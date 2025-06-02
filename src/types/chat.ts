
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sender: string;
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  messages: ChatMessage[];
}

export interface ServerToClientEvents {
  message: (message: ChatMessage) => void;
  messages: (messages: ChatMessage[]) => void;
}

export interface ClientToServerEvents {
  message: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  join_room: (roomId: string) => void;
} 