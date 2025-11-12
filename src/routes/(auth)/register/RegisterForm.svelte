<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Password from '$lib/components/ui/password';
	import Input from '$lib/components/ui/input/input.svelte';
	import { registerSchema, type RegisterSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { dev } from '$app/environment';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	let { data }: { data: { form: SuperValidated<Infer<RegisterSchema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(registerSchema),
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

<form action="?/register" method="POST" class="mt-6 space-y-6" use:enhance>
	<div class="grid grid-cols-2 gap-3">
		<Form.Field {form} name="name" class="space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>First Name</Form.Label>
					<Input {...props} bind:value={$formData.name} type="text" required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="surname" class="space-y-2">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Last Name</Form.Label>
					<Input {...props} bind:value={$formData.surname} required />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
	</div>

	<Form.Field {form} name="email" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} bind:value={$formData.email} type="email" required />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<Password.Root>
					<Password.Input {...props} bind:value={$formData.password} required>
						<Password.ToggleVisibility />
					</Password.Input>
					<Password.Strength />
				</Password.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="acceptTerms" class="space-y-2">
		<Form.Control>
			{#snippet children({ props })}
				<div class="flex items-center gap-3">
					<Checkbox {...props} bind:checked={$formData.acceptTerms} required />
					<Form.Label class="text-sm">
						<p>
							I have read and accept the <a href="/terms" target="_blank" class="hover:underline"
								>Terms of Use</a
							>
							and the
							<a href="/privacy" target="_blank" class="hover:underline">Privacy Policy</a>.
						</p>
					</Form.Label>
				</div>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button class="w-full" disabled={$delayed}>
		Create Account
		{#if $delayed}
			<LoaderCircle class="animate-spin" />
		{/if}
	</Form.Button>

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
