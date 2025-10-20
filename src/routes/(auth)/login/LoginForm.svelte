<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { loginSchema, type LoginSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { dev } from '$app/environment';
	import * as Password from '$lib/components/ui/password';

	let { data }: { data: { form: SuperValidated<Infer<LoginSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(loginSchema),
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

<form method="POST" action="?/login" class="mt-6 space-y-6" use:enhance>
	<Form.Field {form} name="email" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="space-y-0.5">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center justify-between">
					<Form.Label>Password</Form.Label>
					<Button
						href="/password-reset"
						variant="link"
						size="sm"
						class="link intent-info variant-ghost text-sm"
					>
						Forgot password?
					</Button>
				</div>
				<Password.Root>
					<Password.Input {...props} bind:value={$formData.password} required>
						<Password.ToggleVisibility />
					</Password.Input>
				</Password.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="w-full" disabled={$delayed}
		>Sign In
		{#if $delayed}
			<LoaderCircle class="animate-spin" />
		{/if}
	</Form.Button>

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
