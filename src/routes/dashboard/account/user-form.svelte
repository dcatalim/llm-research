<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { userUpdateSchema, type UserUpdateSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card';
	import { dev } from '$app/environment';
	import { toast } from 'svelte-sonner';

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

			<!-- <Form.Button class="hover:cursor-pointer" disabled={$delayed}>
				{#if $delayed}
					<Spinner />
				{:else}
					<Save />
				{/if}
				Save Configuration</Form.Button
			> -->
		</div>
	</div>

	<Card.Root>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Username</Form.Label>
						<Input {...props} placeholder="Username" bind:value={$formData.name} disabled />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Email</Form.Label>
						<Input {...props} placeholder="Email" bind:value={$formData.email} disabled />
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
