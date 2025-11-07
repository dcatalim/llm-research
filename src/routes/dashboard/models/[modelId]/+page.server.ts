import { serializeNonPOJOs } from '$lib/utils';
import { error } from 'console';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(302, '/login');
	}

	const getModel = async (modelId) => {
		try {
			const result = serializeNonPOJOs(await locals.pb.collection('models').getOne(modelId));
			return result;
		} catch (err) {
			console.log('Error: ', err);
			throw error(err.status, err.message);
		}
	};

	return {
		model: getModel(params.modelId)
	};
}) satisfies PageServerLoad;
