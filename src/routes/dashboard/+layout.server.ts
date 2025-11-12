import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, cookies }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(302, '/login');
	}


}) satisfies LayoutServerLoad;
