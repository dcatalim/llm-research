import type { LayoutServerLoad } from './$types';

export const load = (async ({locals, cookies}) => {
    const sidebarCollapsed = cookies.get('sidebar:state') !== 'true';

    return {
        user: locals.user,
        sidebarCollapsed
    };
}) satisfies LayoutServerLoad;