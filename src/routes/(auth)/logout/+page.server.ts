import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({locals}) => {
    locals.pb.authStore.clear();
	locals.user = undefined;

    throw redirect(303, '/login');

}) satisfies PageServerLoad;