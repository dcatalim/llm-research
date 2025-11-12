import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const load = (async ({ cookies, locals }) => {
    let modelId = cookies.get('selected-model');

	if (!modelId) {
		// TODO: show error message
		redirect(302, '/');
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

	return {
		model: await getModelbyId(modelId)
	};

}) satisfies LayoutServerLoad;