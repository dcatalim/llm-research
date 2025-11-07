import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { modelConfigurationSchema } from '$lib/schemas';
import type { PageServerLoad, Actions } from './$types.js';
import { redirect } from '@sveltejs/kit';
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
		form: await superValidate(zod4(modelConfigurationSchema)),
		apiKeys: await getUserApiKeys()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const form = await superValidate(request, zod4(modelConfigurationSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Invalid form');
		}

		try {
			const data = {
				name: form.data.name,
				instructions: form.data.instructions,
				provider: form.data.provider,
				version: form.data.version,
				systemPrompt: form.data.systemPrompt,
				temperature: form.data.temperature,
				maxTokens: form.data.maxTokens,
				topP: form.data.topP,
				frequencyPenalty: form.data.frequencyPenalty,
				api_key: form.data.api_key,
				creator: locals.user?.id
			};

			const record = await locals.pb.collection('models').create(data);

			return message(form, 'Model successfully created!');
		} catch (err: any) {
			console.log('Error: ', err);

			if (err?.message && err?.status) {
				// Will return fail and set form.valid = false, since status is >= 400
				return message(form, err?.message, { status: err?.status });
			}
		}

		return {
			form
		};
	}
};
