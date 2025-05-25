export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

export interface ServerToClientEvents {
  message: (message: ChatMessage) => void;
  messages: (messages: ChatMessage[]) => void;
}

export interface ClientToServerEvents {
  message: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
} 