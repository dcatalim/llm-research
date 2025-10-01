import PocketBase, { RecordService, AuthModel } from 'pocketbase';

export interface Task {
  id:   string;
  name: string;
}

export interface Post {
  id:     string;
  title:  string;
  active: boolean;
}

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: string): RecordService;
  collection(idOrName: 'tasks'): RecordService<Task>;
  collection(idOrName: 'posts'): RecordService<Post>;
}
