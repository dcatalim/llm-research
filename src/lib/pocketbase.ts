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
	title: string;
	userId: string;
	visibility: 'public' | 'private';
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
	type: "file" | "image";
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
