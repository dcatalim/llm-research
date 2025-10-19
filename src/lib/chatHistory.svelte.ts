import type { RecordModel } from 'pocketbase';

export let chats: { history: RecordModel[] } = $state({
	history: []
});
