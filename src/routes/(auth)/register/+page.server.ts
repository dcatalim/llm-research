import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { registerSchema } from '$lib/schemas';

export const load = (async ({ locals }) => {
	if (locals.pb.authStore.isValid) {
		throw redirect(302, '/');
	}

	return {
		title: "Registar",
		form: await superValidate(zod4(registerSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(registerSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Formulário Inválido');
		}

		const data = {
			email: form.data.email,
			emailVisibility: true,
			name: form.data.name + ' ' + form.data.surname,
			password: form.data.password,
			passwordConfirm: form.data.password,
			acceptedTerms: new Date().toISOString(),
		};

		try {
			const user = await locals.pb.collection('users').create(data);

			await locals.pb.collection('users').requestVerification(form.data.email);

			await locals.pb.collection('users').authWithPassword(form.data.email, form.data.password);

			return message(form, 'Verifique o seu email para validar a sua conta');
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
