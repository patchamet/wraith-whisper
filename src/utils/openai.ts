import OpenAI from 'openai';
import { ChatMessage, ChatCompletionOptions } from '@/types/openai';

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default options
const DEFAULT_OPTIONS: ChatCompletionOptions = {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  max_tokens: 1000,
};

/**
 * Create a chat completion with OpenAI
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: Partial<ChatCompletionOptions> = {}
) {
  try {
    const completion = await openai.chat.completions.create({
      messages,
      ...DEFAULT_OPTIONS,
      ...options,
      stream: false,
    });

    return completion;
  } catch (error) {
    console.error('Error in createChatCompletion:', error);
    throw error;
  }
}

/**
 * Create a streaming chat completion with OpenAI
 */
export async function createStreamingChatCompletion(
  messages: ChatMessage[],
  options: Partial<ChatCompletionOptions> = {}
) {
  try {
    const stream = await openai.chat.completions.create({
      messages,
      ...DEFAULT_OPTIONS,
      ...options,
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error in createStreamingChatCompletion:', error);
    throw error;
  }
}

/**
 * Helper function to create a system message
 */
export function createSystemMessage(content: string): ChatMessage {
  return {
    role: 'system',
    content,
  };
}

/**
 * Helper function to create a user message
 */
export function createUserMessage(content: string): ChatMessage {
  return {
    role: 'user',
    content,
  };
}

/**
 * Helper function to create an assistant message
 */
export function createAssistantMessage(content: string): ChatMessage {
  return {
    role: 'assistant',
    content,
  };
} 