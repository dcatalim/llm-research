import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { serializeNonPOJOs } from '$lib/utils';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { apiKeyDeleteSchema } from '$lib/schemas';

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
		apiKeys: getUserApiKeys(),
		form: await superValidate(zod4(apiKeyDeleteSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(apiKeyDeleteSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Invalid form');
		}

		try {
			await locals.pb.collection('api_keys').delete(form.data.id);

			return message(form, 'API key deleted successfully');
		} catch (err) {
			console.log('Error: ', err);

			if (err?.message && err?.status) {
				// Will return fail and set form.valid = false, since status is >= 400
				return message(form, err?.message, { status: err?.status });
			}
		}
	}
};
