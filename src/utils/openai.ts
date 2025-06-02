import OpenAI from 'openai';
import { ChatMessage, ChatCompletionOptions } from '@/types/openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_OPTIONS: ChatCompletionOptions = {
  model: 'gpt-4.1-mini',
  temperature: 0.7,
  max_tokens: 1000,
};

export async function summarizeConversation(messages: ChatMessage[]) {
  try {
    const summaryPrompt: ChatMessage[] = [
      { role: 'system', content: 'Summarizer' },
      { role: 'user', content: 'Summarize this:' },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      messages: summaryPrompt,
      ...DEFAULT_OPTIONS,
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error in summarizeConversation:', error);
    throw error;
  }
}

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