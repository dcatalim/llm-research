import { streamText, type UIMessage, convertToModelMessages, generateId } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import { getMostRecentUserMessage, getTrailingMessageId } from '$lib/utils/chat.js';
import type { Chat, Model } from '$lib/pocketbase.js';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { serializeNonPOJOs } from '$lib/utils';
import { decryptApiKey } from '$lib/server/encryption.js';
import { generateText } from 'ai';



export async function POST({ request, locals, cookies }) {
	const { id, messages }: { id: string; messages: UIMessage[] } = await request.json();

	const selectedChatModel = cookies.get('selected-model');

	// if (!locals.pb.authStore.isValid) {
	// 	error(401, 'Unauthorized');
	// }

	if (!selectedChatModel) {
		error(401, 'No chat model selected');
	}

	const getModelbyId = async (modelId: string) => {
		try {
			const record = await locals.pb.collection('models').getOne(modelId, {
				expand: 'apiKey'
			});
			return serializeNonPOJOs(record as Model);
		} catch (error) {
			console.error('Error fetching model:', error);
			return error;
		}
	};

	const modelDetails = (await getModelbyId(selectedChatModel || '')) as Model;

	const encryptedApiKey = modelDetails?.expand?.apiKey?.encryptedApiKey;

	const decryptedApiKey = decryptApiKey(encryptedApiKey);

	const openrouter = createOpenRouter({
		apiKey: decryptedApiKey
	});

	async function generateTitleFromUserMessage({
		message
	}: {
		message: UIMessage;
	}): Promise<string> {
		try {
			const result = await generateText({
				model: openrouter.chat(modelDetails?.version),
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
			const slicedMessage = message.parts[0]?.text?.slice(0, 80)?.trim();
			if (slicedMessage) {
				return slicedMessage; // Fallback: use the first 80 characters of the user's message
			}
			error(500, e.message || 'Error generating title');
		}
	}

	const userMessage = getMostRecentUserMessage(messages);

	if (!userMessage) {
		error(400, 'No user message found');
	}

	const saveChat = async (id: string, title: string) => {
		try {
			const data = {
				uuid: id,
				title: title,
				model: selectedChatModel,
				userId: locals.user?.id ?? undefined
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
		messages: Array<UIMessage>;
	}) => {
		try {
			for (const message of messages) {
				const data = {
					chatId: chatId,
					role: message.role,
					parts: message.parts,
					metadata: message.metadata ?? ''
				};

				await locals.pb.collection('messages').create(data);
			}
		} catch (err) {
			console.error('Error saving messages:', err);
		}
	};

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
		chat = (await saveChat(id, title)) as Chat;
	}

	// TODO
	// if (chat?.userId !== locals.user?.id && chat?.userId != undefined) {
	// 	error(403, 'Forbidden');
	// }

	saveMessages({
		chatId: chat.id,
		messages: [userMessage]
	});


	const result = streamText({
		model: openrouter.chat(modelDetails?.version),
		system: modelDetails.systemPrompt || undefined,
		maxOutputTokens: modelDetails.maxTokens || undefined,
		temperature: modelDetails.temperature || undefined,
		topP: modelDetails.topP || undefined,
		topK: modelDetails.topK || undefined,
		presencePenalty: modelDetails.presencePenalty || undefined,
		frequencyPenalty: modelDetails.frequencyPenalty || undefined,
		stopSequences: modelDetails.stopSequences || undefined, // TODO
		
		messages: convertToModelMessages(messages),
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages, // IMPORTANT: Required to prevent duplicate messages
		generateMessageId: () => generateId(), // IMPORTANT: Required for proper message ID generation
		onFinish: ({ messages, responseMessage }) => {
			// responseMessage contains just the generated message in UIMessage format
			saveMessages({ chatId: chat.id, messages: [responseMessage] });
		}
	});
}
