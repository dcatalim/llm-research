import { streamText, type UIMessage, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { OPENROUTER_API_KEY } from '$env/static/private';

const openrouter = createOpenRouter({
  apiKey: OPENROUTER_API_KEY,
});

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openrouter.chat('deepseek/deepseek-r1-0528-qwen3-8b:free'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}