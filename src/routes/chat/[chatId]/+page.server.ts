import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params }) => {
	const getChatById = async (chatId: string) => {
		try {
			const chat = await locals.pb.collection('chats').getFirstListItem(`uuid="${chatId}"`);

			return chat;
		} catch (error) {
			console.error('Error fetching chat:', error);
			return undefined;
		}
	};

    const chat = await getChatById(params.chatId);

    const getMessagesByChatId = async (chatId: string) => {
        try {
            const messages = await locals.pb.collection('messages').getFullList({
                filter: `chatId="${chatId}"`,
                sort: '+created'
            });
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    };

	return {
        user: locals.user,
		chat: chat,
        messages: await getMessagesByChatId(chat?.id),
	};
}) satisfies PageServerLoad;
