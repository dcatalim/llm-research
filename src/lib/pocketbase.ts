import PocketBase, { RecordService } from 'pocketbase';
import type { AuthModel } from "pocketbase";

export interface Task {
  id:   string;
  name: string;
}

export interface Post {
  id:     string;
  title:  string;
  active: boolean;
}

export type User = AuthModel

export interface Chat {
  id:     string;
  title:  string;
  userId: string;
  visibility: 'public' | 'private';
}

export interface Message {
  id:     string;
  chatId:  string;
  role: string;
  parts: Array<string>;
  attachments: Array<string>;
}

export interface Document {
  id:     string;
  title:  string;
  content: string;
  kind: string;
  userId: string;
}

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService;
  collection(idOrName: 'users'): RecordService<User>;
  collection(idOrName: 'chats'): RecordService<Chat>;
  collection(idOrName: 'messages'): RecordService<Message>;
}
