import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  model: OpenAI.Chat.ChatModel;
  temperature?: number;
  max_tokens?: number;
} 