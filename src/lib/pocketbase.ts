import PocketBase, { RecordService } from 'pocketbase';

export interface Task {
  id:   string;
  name: string;
}

export interface Post {
  id:     string;
  title:  string;
  active: boolean;
}

export interface User {
  id:       string;
  email:    string;
  name: string;
  verified: boolean;
}

export interface Chat {
  id:     string;
  title:  string;
  userId: string;
  visibility: 'public' | 'private';
}

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService;
  collection(idOrName: 'tasks'): RecordService<Task>;
  collection(idOrName: 'posts'): RecordService<Post>;
  collection(idOrName: 'users'): RecordService<User>;
  collection(idOrName: 'chats'): RecordService<Chat>;
}
