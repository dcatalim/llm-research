<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { userUpdateSchema, type UserUpdateSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card';
	import Save from '@lucide/svelte/icons/save';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { dev } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Password from '$lib/components/ui/password';

	let { data }: { data: { form: SuperValidated<Infer<UserUpdateSchema>> } } = $props();

	const form = superForm(data.form, {
		resetForm: false,
		validators: zod4Client(userUpdateSchema),
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
					// goto('/dashboard/models');
				} else {
					toast.error(form.message);
				}
			}
		}
	});

	const { form: formData, delayed, enhance } = form;

	
</script>

<form method="POST" class="flex flex-col gap-4" use:enhance>
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">User Settings</h1>
			<p class="text-muted-foreground">Configure your user settings</p>
		</div>
		<div class="flex gap-2">
			<!-- <Button variant="outline" disabled>
				<Share2 class="mr-2 h-4 w-4" />
				Generate Share Link
			</Button> -->
			<Form.Button class="hover:cursor-pointer" disabled={$delayed}>
				{#if $delayed}
					<Spinner />
				{:else}
					<Save />
				{/if}
				Save Configuration</Form.Button
			>
		</div>
	</div>

	<Card.Root>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} placeholder="Username" bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input {...props} placeholder="Email" bind:value={$formData.email} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>OpenRouter Key</Form.Label>
						<Password.Root>
							<Password.Input {...props} placeholder="sk-or-..." bind:value={$formData.surname} required>
								<Password.ToggleVisibility />
							</Password.Input>
						</Password.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
	</Card.Root>

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
