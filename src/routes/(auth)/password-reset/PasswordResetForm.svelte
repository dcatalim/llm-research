<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { resetPasswordSchema, type ResetPasswordSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { dev } from '$app/environment';

	let { data }: { data: { form: SuperValidated<Infer<ResetPasswordSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(resetPasswordSchema),
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
				} else {
					toast.error(form.message);
				}
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<form method="POST" class="mt-6 space-y-6" use:enhance>
	<Form.Field {form} name="email" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="block text-sm">Email</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="w-full" disabled={$delayed}
		>Reset Password
		{#if $delayed}
			<LoaderCircle class="animate-spin" />
		{/if}
	</Form.Button>

	<div class="mt-6 text-center">
		<p class="text-sm text-muted-foreground">
			We'll send you an email to reset your password.
		</p>
	</div>

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
