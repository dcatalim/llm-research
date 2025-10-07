import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { apiKeySchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types.js';
import { redirect } from '@sveltejs/kit';
import { encryptApiKey } from '$lib/server/encryption';

export const load = (async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	return {
		form: await superValidate(zod4(apiKeySchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.pb.authStore.isValid) {
			throw redirect(303, '/login');
		}

		const form = await superValidate(request, zod4(apiKeySchema));

		if (!form.valid) {
			return message(form, 'Invalid form');
		}

		try {
			// Encrypt the API key before storing
			const encryptedKey = encryptApiKey(form.data.apiKey);

			const data = {
				name: form.data.name,
				provider: "openrouter",
				encryptedApiKey: encryptedKey,
				creator: locals.user?.id
			};

			await locals.pb.collection('api_keys').create(data);

			return message(form, 'API Key successfully saved!');
		} catch (err: any) {
			console.log('Error: ', err);

			if (err?.message && err?.status) {
				return message(form, err?.message, { status: err?.status });
			}

			return message(form, 'Failed to save API key', { status: 500 });
		}
	}
};
