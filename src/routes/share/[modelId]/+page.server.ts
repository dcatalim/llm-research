import { serializeNonPOJOs } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals, cookies }) => {
	const { modelId } = params;

	// const getModelbyId = async (modelId: string) => {
	// 	try {
	// 		const record = await locals.pb.collection('models').getOne(modelId);
	// 		return serializeNonPOJOs(record);
	// 	} catch (error) {
	// 		console.error('Error fetching model:', error);
	// 		return error;
	// 	}
	// };

	cookies.set('selected-model', modelId, {
		path: '/',
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		httpOnly: true,
		sameSite: 'lax'
	});

	redirect(302, '/chat');
	return {
		// model: await getModelbyId(modelId)
	};
}) satisfies PageServerLoad;
