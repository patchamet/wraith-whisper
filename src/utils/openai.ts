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
    const currentMessage = messages[messages.length - 1];
    const historyMessages = messages.slice(0, messages.length - 1);

    const summaryPrompt: ChatMessage[] = [
      { 
        role: 'system', 
        content: [
          'You are a conversation summarizer.',
          'Your task is to create a concise summary that captures the key points and context of the conversation,',
          'making it easy to continue the discussion naturally.',
          'Focus on maintaining the conversation flow and important details.'
        ].join(' ')
      },
      { 
        role: 'user', 
        content: 'Please summarize the following conversation in a way that preserves context and makes it easy to continue the discussion:'
      },
      ...historyMessages
    ];

    const completion = await openai.chat.completions.create({
      messages: summaryPrompt,
      ...DEFAULT_OPTIONS,
      stream: false,
    });

    const summaryMessage = completion.choices[0].message.content;
    const results = [
      { 
        role: 'system', 
        content: `Continuing from: ${summaryMessage}`,
      },
      currentMessage
    ]
  
    return results; 
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