<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { apiKeySchema, type ApiKeySchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card';
	import Save from '@lucide/svelte/icons/save';
	import { dev } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import * as Password from '$lib/components/ui/password';
	import { goto } from '$app/navigation';

	let { data }: { data: { form: SuperValidated<Infer<ApiKeySchema>> } } = $props();

	const form = superForm(data.form, {
		resetForm: false,
		validators: zod4Client(apiKeySchema),
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
                    goto('/dashboard/keys');
				} else {
					toast.error(form.message);
				}
			}
		}
	});

	const { form: formData, delayed, enhance } = form;

	// const providers = [
	// 	{ value: 'openrouter', label: 'OpenRouter' },
	// 	{ value: 'openai', label: 'OpenAI' },
	// 	{ value: 'anthropic', label: 'Anthropic' },
	// 	{ value: 'google', label: 'Google' },
	// 	{ value: 'meta', label: 'Meta' },
	// 	{ value: 'other', label: 'Other' }
	// ];

	// const providerTriggerContent = $derived(
	// 	providers.find((f) => f.value === $formData.provider)?.label ?? 'Select a provider'
	// );

</script>

<form method="POST" class="flex flex-col gap-4" use:enhance>
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Add API Key</h1>
			<p class="text-muted-foreground">Store your API keys securely</p>
		</div>
		<div class="flex gap-2">
			<Form.Button class="hover:cursor-pointer" disabled={$delayed}>
				{#if $delayed}
					<Spinner />
				{:else}
					<Save />
				{/if}
				Save API Key</Form.Button
			>
		</div>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>API Key Details</Card.Title>
			<Card.Description>Your API key will be encrypted before storage</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Key Name</Form.Label>
						<Input {...props} placeholder="My OpenRouter Key" bind:value={$formData.name} />
					{/snippet}
				</Form.Control>
				<Form.Description>A friendly name to identify this key</Form.Description>
				<Form.FieldErrors />
			</Form.Field>

			<!-- <Form.Field {form} name="provider">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Provider</Form.Label>
						<Select.Root type="single" bind:value={$formData.provider} name={props.name}>
							<Select.Trigger {...props} class="w-full">
								{providerTriggerContent}
							</Select.Trigger>
							<Select.Content>
								{#each providers as item (item.value)}
									<Select.Item value={item.value} label={item.label} />
								{/each}
							</Select.Content>
						</Select.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>The API provider for this key</Form.Description>
				<Form.FieldErrors />
			</Form.Field> -->

			<Form.Field {form} name="apiKey">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>API Key</Form.Label>
						<Password.Root>
							<Password.Input {...props} bind:value={$formData.apiKey} placeholder="sk-or-...">
								<Password.ToggleVisibility />
							</Password.Input>
						</Password.Root>
					{/snippet}
				</Form.Control>
				<Form.Description>Your API key will be encrypted before storage</Form.Description>
				<Form.FieldErrors />
			</Form.Field>
		</Card.Content>
	</Card.Root>

	{#if dev}
		<SuperDebug data={$formData} />
	{/if}
</form>
