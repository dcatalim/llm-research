import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const load = (async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	const getUserApiKeys = async () => {
		try {
			const records = await locals.pb.collection('api_keys').getFullList({
				sort: '-created'
			});

			return serializeNonPOJOs(records);
		} catch (error) {
			console.error('Error fetching API keys:', error);
			return [];
		}
	};

	return {
		apiKeys: getUserApiKeys()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		if (!locals.pb.authStore.isValid) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const keyId = formData.get('id')?.toString();

		if (!keyId) {
			return fail(400, { message: 'Invalid key ID' });
		}

		try {
			await locals.pb.collection('api_keys').delete(keyId);
			return { success: true };
		} catch (error) {
			console.error('Error deleting API key:', error);
			return fail(500, { message: 'Failed to delete API key' });
		}
	}
};