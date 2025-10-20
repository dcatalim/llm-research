import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, cookies}) => {
	const { user } = locals;

    const sidebarCollapsed = cookies.get('sidebar:state') !== 'true';

	return {
        user,
		sidebarCollapsed,
	};
}) satisfies LayoutServerLoad;
