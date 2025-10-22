import type { FilePart, AssistantModelMessage, ToolModelMessage , UIMessage, UIMessagePart, TextUIPart } from 'ai';
import type { Message as DBMessage, Document } from '$lib/pocketbase';

export function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
	return messages.map((message) => ({
		id: message.id,
		parts: message.parts,
		role: message.role as "system" | "user" | "assistant",
		createdAt: message.created,
	}));
}

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
	const userMessages = messages.filter((message) => message.role === 'user');
	return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(documents: Array<Document>, index: number) {
	if (!documents) return new Date();
	if (index > documents.length) return new Date();

	return documents[index].created;
}

type ResponseMessageWithoutId = ToolModelMessage  | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getTrailingMessageId({
	messages
}: {
	messages: Array<ResponseMessage>;
}): string | null {
	const trailingMessage = messages.at(-1);

	if (!trailingMessage) return null;

	return trailingMessage.id;
}
