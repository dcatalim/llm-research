<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { modelConfigurationSchema, type ModelConfigurationSchema } from '$lib/schemas';
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

	let { data }: { data: { form: SuperValidated<Infer<ModelConfigurationSchema>> } } = $props();

	const form = superForm(data.form, {
		resetForm: false,
		validators: zod4Client(modelConfigurationSchema),
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

	const providers = [
		{ value: 'openai', label: 'OpenAI' },
		{ value: 'anthropic', label: 'Anthropic' },
		{ value: 'google', label: 'Google' },
		{ value: 'meta', label: 'Meta' }
	];

	const providerTriggerContent = $derived(
		providers.find((f) => f.value === $formData.provider)?.label ?? 'Select a provider'
	);

	const versions = [
		{ value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
		{ value: 'gpt-4', label: 'GPT-4' },
		{ value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
	];

	const versionTriggerContent = $derived(
		versions.find((f) => f.value === $formData.version)?.label ?? 'Select a version'
	);
</script>

<form method="POST" class="flex flex-col gap-4" use:enhance>
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Model Configuration</h1>
			<p class="text-muted-foreground">Configure your custom LLM settings</p>
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

	<div class="grid gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Basic Settings</Card.Title>
				<Card.Description>Configure the core model parameters</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Configuration Name</Form.Label>
							<Input {...props} placeholder="My Research Assistant" bind:value={$formData.name} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="provider">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Model Provider</Form.Label>
							<Select.Root type="single" bind:value={$formData.provider} name={props.name}>
								<Select.Trigger {...props} class="w-[180px]">
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
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="version">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Model Version</Form.Label>
							<Select.Root type="single" bind:value={$formData.version} name={props.name}>
								<Select.Trigger {...props} class="w-[180px]">
									{versionTriggerContent}
								</Select.Trigger>
								<Select.Content>
									{#each versions as item (item.value)}
										<Select.Item value={item.value} label={item.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="systemPrompt">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>System Prompt</Form.Label>
							<Textarea
								{...props}
								placeholder="You are a helpful research assistant..."
								class="min-h-32 bg-background"
								bind:value={$formData.systemPrompt}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Advanced Parameters</Card.Title>
				<Card.Description>Fine-tune model behavior</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Form.Field {form} name="temperature">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								<Form.Label>Temperature</Form.Label>
								<span class="text-sm text-muted-foreground">{$formData.temperature}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.temperature} />
							<Slider
								type="single"
								{...props}
								bind:value={$formData.temperature}
								max={2}
								step={0.1}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Controls randomness. Lower is more focused, higher is more creative.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="maxTokens">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								<Form.Label>Max Tokens</Form.Label>
								<span class="text-sm text-muted-foreground">{$formData.maxTokens}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.maxTokens} />

							<Slider
								type="single"
								{...props}
								bind:value={$formData.maxTokens}
								max={4096}
								step={128}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Maximum length of the generated response.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="topP">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								<Form.Label>Top P</Form.Label>
								<span class="text-sm text-muted-foreground">{$formData.topP}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.topP} />

							<Slider type="single" {...props} bind:value={$formData.topP} max={1} step={0.05} />
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Nucleus sampling threshold for token selection.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="frequencyPenalty">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								<Form.Label>Frequency Penalty</Form.Label>
								<span class="text-sm text-muted-foreground">{$formData.frequencyPenalty}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.frequencyPenalty} />

							<Slider
								type="single"
								{...props}
								bind:value={$formData.frequencyPenalty}
								max={2}
								step={0.1}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs">Reduces repetition of token sequences.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- <Card.Root>
		<Card.Header>
			<Card.Title>Testing & Sharing</Card.Title>
			<Card.Description>Configure how testers interact with this model</Card.Description>
		</Card.Header>
		<Card.Content class="w-full space-y-2">
			<div class="flex flex-row items-center justify-between rounded-lg border p-4">
				<div class="space-y-0.5">
					<Label>Marketing emails</Label>
					<p class="text-muted-foreground">
						Receive emails about new products, features, and more.
					</p>
				</div>
				<Switch checked />
			</div>
			<div class="flex flex-row items-center justify-between rounded-lg border p-4">
				<div class="space-y-0.5">
					<Label>Security emails</Label>
					<p class="text-muted-foreground">Receive emails about your account security.</p>
				</div>
				<Switch aria-readonly disabled />
			</div>
		</Card.Content>
	</Card.Root> -->

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
