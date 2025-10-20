import {
	streamText,
	type UIMessage,
	convertToModelMessages,
	generateId
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { OPENROUTER_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { getMostRecentUserMessage, getTrailingMessageId } from '$lib/utils/chat.js';
import type { Chat, Message } from '$lib/pocketbase.js';
import { generateTitleFromUserMessage } from '$lib/server/ai/utils';

const openrouter = createOpenRouter({
	apiKey: OPENROUTER_API_KEY
});

export async function POST({ request, locals }) {
	const { id, messages }: { id: string; messages: UIMessage[] } = await request.json();

	if (!locals.pb.authStore.isValid) {
		error(401, 'Unauthorized');
	}

	const userMessage = getMostRecentUserMessage(messages);

	if (!userMessage) {
		error(400, 'No user message found');
	}

	const saveChat = async (id: string, userId: string, title: string) => {
		try {
			const data = {
				uuid: id,
				title: title,
				userId: userId
			};

			const record = await locals.pb.collection('chats').create(data);
			return record as Chat;
		} catch (err) {
			console.error('Error creating chat:', err);
			return undefined;
		}
	};

	const saveMessages = async ({
		chatId,
		messages
	}: {
		chatId: string;
		messages: Array<Message>;
	}) => {
		try {
			for (const message of messages) {
				const data = {
					chatId: chatId,
					role: message.role,
					parts: message.parts,
					attachments: message.attachments
				};

				await locals.pb.collection('messages').create(data);
			}
		} catch (err) {
			console.error('Error saving messages:', err);
		}
	};

	if (locals.user) {
		let chat: Chat | undefined;
		try {
			const chatResult = await locals.pb.collection('chats').getFirstListItem<Chat>(`uuid="${id}"`);
			chat = chatResult;
		} catch (err) {
			chat = undefined;
			// console.error('Error fetching chat:', err);
		}

		if (!chat) {
			const title = await generateTitleFromUserMessage({ message: userMessage });
			chat = (await saveChat(id, locals.user.id, title)) as Chat;
		}

		if (chat?.userId !== locals.user?.id) {
			error(403, 'Forbidden');
		}

		saveMessages({
			chatId: chat.id,
			messages: [
				{
					chatId: chat.id,
					id: userMessage.id,
					role: 'user',
					parts: userMessage.parts,
					attachments: userMessage.experimental_attachments ?? []
				}
			]
		});

		const result = streamText({
			model: openrouter.chat('meta-llama/llama-3.3-8b-instruct:free'),
			messages: convertToModelMessages(messages)
		});

		return result.toUIMessageStreamResponse({
			originalMessages: messages, // IMPORTANT: Required to prevent duplicate messages
			generateMessageId: () => generateId(), // IMPORTANT: Required for proper message ID generation
			onFinish: ({ messages, responseMessage }) => {
				// responseMessage contains just the generated message in UIMessage format
				saveMessages({ chatId: chat.id, messages: [ responseMessage] });
			}
		});
	}
}
