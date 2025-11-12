import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals, cookies }) => {
	const { modelId } = params;

	cookies.set('selected-model', modelId, {
		path: '/',
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		httpOnly: true,
		sameSite: 'lax'
	});

	redirect(302, '/chat');

}) satisfies PageServerLoad;
