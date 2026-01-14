import { serializeNonPOJOs } from '$lib/utils';
import { error } from 'console';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(302, '/login');
	}

	const getModelbyId = async (modelId: string) => {
		try {
			const record = await locals.pb.collection('models').getOne(modelId);
			return serializeNonPOJOs(record);
		} catch (error) {
			console.error('Error fetching model:', error);
			return error;
		}
	};

	const getChatsByModelId = async (modelId: string) => {
		try {
			const records = await locals.pb.collection('chats').getFullList({
				filter: `model = "${modelId}"`,
				sort: '-created',
			});
			return serializeNonPOJOs(records);
		} catch (error) {
			console.error('Error fetching chats:', error);
			return error;
		}
	};
	
	return {
		model: await getModelbyId(params.modelId),
		chats: await getChatsByModelId(params.modelId)
	};
}) satisfies PageServerLoad;
