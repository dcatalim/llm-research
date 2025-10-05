import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const load = (async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	const getUserModels = async () => {
		try {
			const records = await locals.pb.collection('models').getFullList();

			return serializeNonPOJOs(records);
		} catch (error) {
			console.error(error);

			return error;
		}
	};
	return {
		models: getUserModels()
	};
}) satisfies PageServerLoad;
