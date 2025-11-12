import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals, params, parent }) => {
    const parentData = await parent();

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

    if (!chat) {
        redirect(302, '/chat');
    }

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
        ...parentData,
        chat: chat,
        messages: await getMessagesByChatId(chat?.id),
    };
}) satisfies PageServerLoad;
