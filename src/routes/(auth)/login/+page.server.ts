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
		title: 'Iniciar Sessão',
		form: await superValidate(zod4(loginSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ request, locals, fetch}) => {
		const form = await superValidate(request, zod4(loginSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Formulário Inválido');
		}

		try {
			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);

			if (!locals.pb.authStore?.record?.verified) {
				locals.pb.authStore.clear();

				return message(form, 'Tem de verificar o seu email antes de fazer login', {
					status: 403
				});
			}
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
