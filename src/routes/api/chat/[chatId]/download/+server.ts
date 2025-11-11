import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const GET: RequestHandler = async ({ locals, params }) => {
	const chatId = params.chatId;

	if (!chatId) {
		throw error(400, 'Chat ID is required');
	}

	try {
		// Get chat details
		const chat = await locals.pb.collection('chats').getOne(chatId);

		// Get all messages for this chat
		const messages = await locals.pb.collection('messages').getFullList({
			filter: `chatId="${chatId}"`,
			sort: '+created'
		});

		// Get model details
		let model = null;
		if (chat.model) {
			try {
				model = await locals.pb.collection('models').getOne(chat.model);
			} catch (err) {
				console.error('Error fetching model:', err);
			}
		}

		const chatData = {
			chat: serializeNonPOJOs(chat),
			messages: serializeNonPOJOs(messages),
			model: model ? serializeNonPOJOs(model) : null,
			exportDate: new Date().toISOString(),
			messageCount: messages.length
		};

		return json(chatData);
	} catch (err) {
		console.error('Error downloading chat:', err);
		throw error(500, 'Failed to download chat data');
	}
};
