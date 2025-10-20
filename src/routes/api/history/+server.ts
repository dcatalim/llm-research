import { error, json } from '@sveltejs/kit';

export async function GET({ locals }) {
	if (!locals.pb.authStore.isValid) {
		error(401, 'Unauthorized');
	}

	const getChatsByUserId = async (id: string ) => {
		try {
			const records = await locals.pb.collection('chats').getFullList({
				filter: `userId="${id}"`,
				sort: '-created'
			});
			return records;
		} catch (err) {
			console.error('Error fetching chats:', err);
			return [];
		}
	};

	const chats = await getChatsByUserId(locals.user?.id ?? '');

	return json(chats);
}
