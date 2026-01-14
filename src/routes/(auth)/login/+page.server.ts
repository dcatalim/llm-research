import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';
import { loginSchema } from '$lib/schemas';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load = (async ({ locals }) => {
	if (locals.pb.authStore.isValid) {
		throw redirect(302, '/');
	}

	return {
		form: await superValidate(zod4(loginSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ request, locals}) => {
		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Invalid form');
		}

		try {
			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);

			
			// redirect happens because they become logged in and cant access this page
		} catch (err) {
			console.log('Error: ', err);

			if (err?.message && err?.status) {
				// Will return fail and set form.valid = false, since status is >= 400
				return message(form, err?.message, { status: err?.status });
			}
		}
	},
};
