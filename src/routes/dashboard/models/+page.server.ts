import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
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

export const actions: Actions = {
	delete: async ({ locals, request }) => {
		if (!locals.pb.authStore.isValid) {
			throw redirect(303, '/login');
		}

		const formData = await request.formData();
		const modelId = formData.get('id')?.toString();

		if (!modelId) {
			return fail(400, { message: 'Invalid model ID' });
		}

		try {
			// Verify the model belongs to the current user
			const model = await locals.pb.collection('models').getOne(modelId);
			
			if (model.creator !== locals.user?.id) {
				return fail(403, { message: 'Not authorized to delete this model' });
			}

			await locals.pb.collection('models').delete(modelId);
			return { success: true, message: 'Model deleted successfully' };
		} catch (error: any) {
			console.error('Error deleting model:', error);
			return fail(500, { message: 'Failed to delete model' });
		}
	}
};
