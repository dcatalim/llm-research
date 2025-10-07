import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { userUpdateSchema } from '$lib/schemas';
import { serializeNonPOJOs } from '$lib/utils';
import { createHash } from 'crypto';

export const load = (async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		throw redirect(303, '/login');
	}


	return {
		user: locals.user,
		form: await superValidate(serializeNonPOJOs(locals.user), zod4(userUpdateSchema))
	};
}) satisfies PageServerLoad;
