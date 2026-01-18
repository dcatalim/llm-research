import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, cookies }) => {
	const sidebarCollapsed = cookies.get('sidebar:state') !== 'true';

	if (!cookies.get('browser-id')) {
		cookies.set('browser-id', crypto.randomUUID(), {
			path: '/',
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			httpOnly: true,
			sameSite: 'lax'
		});
	}

	return {
		user: locals.user,
		sidebarCollapsed
	};
}) satisfies LayoutServerLoad;
