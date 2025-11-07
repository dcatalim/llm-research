import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { modelConfigurationSchema } from '$lib/schemas';
import { fail } from '@sveltejs/kit';
import { message } from 'sveltekit-superforms';
import type { Actions } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import { serializeNonPOJOs } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, params }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(302, '/login');
	}

	const modelId = params.modelId;

	const getModelbyId = async (modelId: string) => {
		try {
			const record = await locals.pb.collection('models').getOne(modelId);
			return serializeNonPOJOs(record);
		} catch (error) {
			console.error('Error fetching model:', error);
			return error;
		}
	};

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

	const model = await getModelbyId(modelId);

	if (!model) {
		throw fail(404, 'Model not found');
	}

	return {
		model: model,
		apiKeys: await getUserApiKeys(),
		form: await superValidate(model, zod4(modelConfigurationSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ locals, request, params }) => {
		const modelId = params.modelId as string;

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
				creator: locals.user?.id
			};

			const record = await locals.pb.collection('models').update(modelId, data);
			return message(form, 'Model successfully updated!');
		} catch (err) {
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
