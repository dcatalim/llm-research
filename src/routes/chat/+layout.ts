import type { Chat } from '$lib/pocketbase';

export async function load({ parent, fetch }) {
	const data =  await parent();
	let chats = Promise.resolve<Chat[]>([]);
	if (data.user) {
		chats = fetch('/api/history').then((res) => res.json());
	}

	return {
		chats,
		...data
	};
}
