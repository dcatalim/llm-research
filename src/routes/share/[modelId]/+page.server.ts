import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ url, params, locals, cookies }) => {
	const { modelId } = params;
	const responseId = url.searchParams.get("rid") ?? ''

	cookies.set('selected-model', modelId, {
		path: '/',
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		httpOnly: true,
		sameSite: 'lax'
	});

	cookies.set('response-id', responseId, {
		path: '/',
		expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		httpOnly: true,
		sameSite: 'lax'
	});

	redirect(302, '/chat');

}) satisfies PageServerLoad;
