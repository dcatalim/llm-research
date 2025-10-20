import { generateText, type UIMessage } from 'ai';
import { GOOGLE_GENERATIVE_AI_API_KEY, OPENROUTER_API_KEY } from '$env/static/private';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
	apiKey: GOOGLE_GENERATIVE_AI_API_KEY
});

const openrouter = createOpenRouter({
	apiKey: OPENROUTER_API_KEY
});

export async function generateTitleFromUserMessage({
	message
}: {
	message: UIMessage;
}): Promise<string> {
	try {
		const result = await generateText({
			model: google('gemini-2.5-flash'),
			system: `\n
          - you will generate a short title based on the first message a user begins a conversation with
          - ensure it is not more than 80 characters long
          - the title should be a summary of the user's message
          - do not use quotes or colons`,
			prompt: JSON.stringify(message)
		});

		return result.text;
	} catch (e) {
		console.error('Error generating title:', e.message);
		error(500, 'Error generating title');
	}
}
