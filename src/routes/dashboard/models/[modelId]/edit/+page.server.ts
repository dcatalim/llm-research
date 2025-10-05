import { superValidate } from 'sveltekit-superforms';
import type { PageServerLoad } from './$types';
import { zod4 } from 'sveltekit-superforms/adapters';
import { modelConfigurationSchema } from '$lib/schemas';
import { fail } from '@sveltejs/kit';

const getModelbyId = async (pb, modelId: string) => {
	try {
		const record = await pb.collection('models').getOne(modelId);
		return record;
	} catch (error) {
		console.error('Error fetching model:', error);
		return null;
	}
};

export const load = (async ({ locals, params }) => {
	const modelId = params.modelId;

	const record = await getModelbyId(locals.pb, modelId);

	if (!record) {
		throw fail(404, 'Model not found');
	}

	return {
        model: record,
		form: await superValidate(record, zod4(modelConfigurationSchema))
	};
}) satisfies PageServerLoad;
