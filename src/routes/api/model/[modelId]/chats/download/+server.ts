import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { serializeNonPOJOs } from '$lib/utils';

export const GET: RequestHandler = async ({ locals, params }) => {
	const modelId = params.modelId;

	if (!modelId) {
		return new Response('Model ID is required', { status: 400 });
	}

	try {
		// Get chat details
		const chatmessages = serializeNonPOJOs(
			await locals.pb.collection('messages').getFullList({
				filter: `chatId.model="${modelId}"`,
				sort: '+created',
				expand: 'chatId.model' // Expand chat details for each message
			})
		);

		const chats = [];

		const messages = Object.groupBy(chatmessages, ({ chatId }) => chatId);

		for (const message of chatmessages) {
			if (!chats.find((c) => c.id === message.chatId)) {
				delete message.expand.chatId.expand; // Remove model details from chat
				chats.push({
					...message.expand.chatId,
					messages: messages[message.chatId] || [],
                    messageCount: messages[message.chatId]?.length || 0
				});
			}
			delete message.expand; // Remove model details from chat
		}

		return json(chats);
	} catch (err) {
		console.error('Error downloading chat:', err);
		throw error(500, 'Failed to download chat data');
	}
};
