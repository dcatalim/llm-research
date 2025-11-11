import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import PocketBase, { RecordService } from 'pocketbase';
import type { AuthModel } from 'pocketbase';

export interface Task {
	id: string;
	name: string;
}

export interface Post {
	id: string;
	title: string;
	active: boolean;
}

export type User = AuthModel;

export interface Chat {
	id: string;
	uuid: string;
	title: string;
	userId: string;
	model: string;
	created: Date;
	updated: Date;
}

export interface Model {
	id: string;
	name: string;
	instructions: string;
	provider: string;
	version: string;
	systemPrompt: string;
	temperature: number;
	topP: number;
	topK: number;
	frequencyPenalty: number;
	presencePenalty: number;
	repetitionPenalty: number;
	minP: number;
	topA: number;
	maxTokens: number;
	creator: string;
	apiKey: string;
	allowFiles: boolean;
	suggestedMessages: string[];
	created: Date;
	updated: Date;
}

export interface Message {
	id: string;
	chatId: string;
	role: string;
	parts: Array<string>;
	attachments: Array<string>;
	created: Date;
	updated: Date;
}

export interface Document {
	id: string;
	type: 'file' | 'image';
	filename: string;
	mediaType: string;
	data: string;
	userId: string;
	created: Date;
	updated: Date;
}

export interface TypedPocketBase extends PocketBase {
	collection(idOrName: string): RecordService;
	collection(idOrName: 'users'): RecordService<User>;
	collection(idOrName: 'chats'): RecordService<Chat>;
	collection(idOrName: 'messages'): RecordService<Message>;
	collection(idOrName: 'models'): RecordService<Model>;
}

export const getImageURL = (
	collectionId: string,
	recordId: string,
	fileName: string,
	size = '100x100'
) => {
	if (size === 'full') {
		return `${PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}`;
	}
	return `${PUBLIC_POCKETBASE_URL}/api/files/${collectionId}/${recordId}/${fileName}?thumb=${size}`;
};
