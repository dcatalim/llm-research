import { streamText, type UIMessage, convertToModelMessages, generateId } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { error } from '@sveltejs/kit';
import { getMostRecentUserMessage } from '$lib/utils/chat.js';
import type { Chat, Model } from '$lib/pocketbase.js';
import { serializeNonPOJOs } from '$lib/utils';
import { decryptApiKey } from '$lib/server/encryption.js';
import type { RequestEvent } from './$types';

// Constants
const MAX_TITLE_LENGTH = 60;

// Helper Functions
async function getModelById(pb: RequestEvent['locals']['pb'], modelId: string): Promise<Model> {
	try {
		const record = await pb.collection('models').getOne(modelId, {
			expand: 'apiKey'
		});
		return serializeNonPOJOs(record as Model);
	} catch (err) {
		console.error('Error fetching model:', err);
		throw error(500, 'Failed to fetch model details');
	}
}

function getTitleFromUserMessage(message: UIMessage): string {
	const slicedMessage = message.parts[0]?.text?.slice(0, MAX_TITLE_LENGTH)?.trim();
	if (slicedMessage) {
		return slicedMessage;
	}
	throw error(400, 'User message is empty');
}

async function findOrCreateChat(
	chatId: string,
	pb: RequestEvent['locals']['pb'],
	locals: RequestEvent['locals'],
	cookies: RequestEvent['cookies'],
	selectedChatModel: string,
	userMessage: UIMessage
): Promise<Chat> {
	try {
		const existingChat = await pb.collection('chats').getFirstListItem<Chat>(`uuid="${chatId}"`);
		return existingChat;
	} catch {
		const title = getTitleFromUserMessage(userMessage);
		return await createChat(chatId, title, selectedChatModel, locals, cookies, pb);
	}
}

async function createChat(
	id: string,
	title: string,
	modelId: string,
	locals: RequestEvent['locals'],
	cookies: RequestEvent['cookies'],
	pb: RequestEvent['locals']['pb']
): Promise<Chat> {
	try {
		const data = {
			uuid: id,
			title,
			model: modelId,
			userId: locals.user?.id ?? undefined,
			browserId: cookies.get('browser-id') ?? undefined
		};

		const record = await pb.collection('chats').create(data);
		return record as Chat;
	} catch (err) {
		console.error('Error creating chat:', err);
		throw error(500, 'Failed to create chat');
	}
}

async function saveMessages(
	pb: RequestEvent['locals']['pb'],
	chatId: string,
	messages: UIMessage[]
): Promise<void> {
	try {
		const createPromises = messages.map((message) => {
			const data = {
				chatId,
				role: message.role,
				parts: message.parts,
				metadata: message.metadata ?? ''
			};
			return pb.collection('messages').create(data);
		});

		await Promise.all(createPromises);
	} catch (err) {
		console.error('Error saving messages:', err);
		// Don't throw - allow the request to continue even if message saving fails
	}
}

function buildSystemPrompt(modelDetails: Model): string {
	const basePrompt = modelDetails.systemPrompt || '';
	
	if (!modelDetails?.filesContext) {
		return basePrompt;
	}

	const documentationSection = `Use the provided DOCUMENTATION below to answer the user's questions. 
If the answer is not in the documentation, state that you don't know.

<DOCUMENTATION>
${modelDetails.filesContext}
</DOCUMENTATION>`;

	return basePrompt + '\n' + documentationSection;
}

function buildStreamConfig(modelDetails: Model, messages: UIMessage[]) {
	return {
		model: modelDetails.version,
		system: buildSystemPrompt(modelDetails),
		messages: convertToModelMessages(messages),
		maxOutputTokens: modelDetails.maxTokens || undefined,
		temperature: modelDetails.temperature || undefined,
		topP: modelDetails.topP || undefined,
		topK: modelDetails.topK || undefined,
		presencePenalty: modelDetails.presencePenalty || undefined,
		frequencyPenalty: modelDetails.frequencyPenalty || undefined,
		stopSequences: modelDetails.stopSequences || undefined
	};
}

// Main Handler
export async function POST({ request, locals, cookies }: RequestEvent) {
	// Parse request
	const { id, messages }: { id: string; messages: UIMessage[] } = await request.json();

	// Validate model selection
	const selectedChatModel = cookies.get('selected-model');
	if (!selectedChatModel) {
		throw error(401, 'No chat model selected');
	}

	// Fetch model details and decrypt API key
	const modelDetails = await getModelById(locals.pb, selectedChatModel);
	const encryptedApiKey = modelDetails?.expand?.apiKey?.encryptedApiKey;
	const decryptedApiKey = decryptApiKey(encryptedApiKey);
	
	const openrouter = createOpenRouter({
		apiKey: decryptedApiKey
	});

	// Validate user message
	const userMessage = getMostRecentUserMessage(messages);
	if (!userMessage) {
		throw error(400, 'No user message found');
	}

	// Find or create chat
	const chat = await findOrCreateChat(
		id,
		locals.pb,
		locals,
		cookies,
		selectedChatModel,
		userMessage
	);

	// TODO: Add authorization check
	// if (chat?.userId !== locals.user?.id && chat?.userId != undefined) {
	// 	throw error(403, 'Forbidden');
	// }

	// Save user message
	await saveMessages(locals.pb, chat.id, [userMessage]);

	// Stream AI response
	const streamConfig = buildStreamConfig(modelDetails, messages);
	const result = streamText({
		...streamConfig,
		model: openrouter.chat(streamConfig.model)
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		generateMessageId: () => generateId(),
		onFinish: async ({ responseMessage }) => {
			await saveMessages(locals.pb, chat.id, [responseMessage]);
		}
	});
}
