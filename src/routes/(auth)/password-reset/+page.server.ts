import { resetPasswordSchema } from '$lib/schemas';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { redirect } from '@sveltejs/kit';

export const load = (async ({locals}) => {
	if (locals.pb.authStore.isValid) {
		throw redirect(302, '/');
	}

	return {
		title: "Recuperar Password",
		form: await superValidate(zod4(resetPasswordSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(resetPasswordSchema));

		if (!form.valid) {
			// Will return fail(400, { form }) since form isn't valid
			return message(form, 'Formulário Inválido');
		}

		try {
			await locals.pb.collection('users').requestPasswordReset(form.data.email);

			return message(form, 'Email enviado com sucesso!');
		} catch (err) {
			console.log('Error: ', err);

			if (err?.message && err?.status) {
				// Will return fail and set form.valid = false, since status is >= 400
				return message(form, err?.message, { status: err?.status });
			}
		}
	}
};
