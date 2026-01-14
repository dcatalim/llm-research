import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const load = (async ({ locals, params }) => {

    const getChatById = async (chatId: string) => {
        try {
            const chat = await locals.pb.collection('chats').getFirstListItem(`uuid="${chatId}"`);

            return serializeNonPOJOs(chat);
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
            return serializeNonPOJOs(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    };

    const getModelbyId = async (modelId: string) => {
		try {
			const record = await locals.pb.collection('models').getOne(modelId);
			return serializeNonPOJOs(record);
		} catch (error) {
			console.error('Error fetching model:', error);
			return error;
		}
	};

    return {
        chat: chat,
        messages: await getMessagesByChatId(chat?.id),
        model: await getModelbyId(chat?.model),
    };
}) satisfies PageServerLoad;
