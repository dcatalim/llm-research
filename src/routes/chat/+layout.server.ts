import { redirect } from '@sveltejs/kit';
import { serializeNonPOJOs } from '$lib/utils';

export const load = (async ({ locals, cookies }) => {
	
	const { user } = locals;


	let modelId = cookies.get('selected-model');

	if (!modelId) {
		// TODO: show error message
		redirect(302, '/');
	}
	
	return {
		user,
	};
});
