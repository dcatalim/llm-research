<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { modelConfigurationSchema, type ModelConfigurationSchema } from '$lib/schemas';
	import SuperDebug, { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as Card from '$lib/components/ui/card';
	import Save from '@lucide/svelte/icons/save';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Slider } from '$lib/components/ui/slider/index.js';
	import { dev } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { onMount, tick } from 'svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { cn } from '$lib/utils.js';
	import * as Select from '$lib/components/ui/select';

	let { data }: { data: { form: SuperValidated<Infer<ModelConfigurationSchema>>, apiKeys: any[] } } = $props();

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
					console.error('Form submission error:', form.errors);
				}
			}
		}
	});

	const { form: formData, delayed, enhance } = form;

	interface OpenRouterModel {
		id: string;
		name: string;
		description?: string;
		context_length?: number;
		pricing?: {
			prompt: string;
			completion: string;
		};
	}

	let models = $state<OpenRouterModel[]>([]);
	let loadingModels = $state(true);
	let selectedModelId = $state($formData.version || '');
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	// Fetch models from OpenRouter API
	onMount(async () => {
		try {
			const response = await fetch('https://openrouter.ai/api/v1/models');
			const result = await response.json();

			if (result.data && Array.isArray(result.data)) {
				models = result.data;
			}
		} catch (error) {
			console.error('Failed to fetch models:', error);
			toast.error('Failed to load models from OpenRouter');
		} finally {
			loadingModels = false;
		}
	});

	const modelOptions = $derived(
		models.map((model) => ({
			value: model.id,
			label: model.name || model.id
		}))
	);

	const selectedModelLabel = $derived(
		modelOptions.find((m) => m.value === selectedModelId)?.label ?? 'Select a model...'
	);

	// Extract provider from model ID (e.g., "openai/gpt-4" -> "openai")
	$effect(() => {
		if (selectedModelId) {
			const provider = selectedModelId.split('/')[0] || '';
			$formData.provider = provider;
			$formData.version = selectedModelId;
		}
	});

	// Close popover and refocus trigger button
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef?.focus();
		});
	}
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
				<input type="hidden" name="provider" bind:value={$formData.provider} />

				<Form.Field {form} name="version">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Model</Form.Label>
							{#if loadingModels}
								<div
									class="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2"
								>
									<Spinner class="h-4 w-4" />
									<span class="text-sm text-muted-foreground">Loading models...</span>
								</div>
							{:else}
								<input type="hidden" {...props} bind:value={selectedModelId} />
								<Popover.Root bind:open>
									<Popover.Trigger bind:ref={triggerRef}>
										{#snippet child({ props: popoverProps })}
											<Button
												variant="outline"
												class="w-full justify-between"
												{...popoverProps}
												role="combobox"
												aria-expanded={open}
											>
												{selectedModelLabel}
												<ChevronsUpDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
											</Button>
										{/snippet}
									</Popover.Trigger>
									<Popover.Content class="w-full p-0">
										<Command.Root>
											<Command.Input placeholder="Search models..." />
											<Command.List>
												<Command.Empty>No model found.</Command.Empty>
												<Command.Group>
													{#each modelOptions as model, index (model.value)}
														<Command.Item
															value={model.value}
															onSelect={() => {
																selectedModelId = model.value;
																closeAndFocusTrigger();
															}}
														>
															<CheckIcon
																class={cn(
																	'mr-2 size-4',
																	selectedModelId !== model.value && 'text-transparent'
																)}
															/>
															{model.label}
														</Command.Item>
													{/each}
												</Command.Group>
											</Command.List>
										</Command.Root>
									</Popover.Content>
								</Popover.Root>
							{/if}
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Select a model from OpenRouter's available models.</Form.Description
					>
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

	<Card.Root>
		<Card.Header>
			<Card.Title>Additional Configuration</Card.Title>
			<Card.Description>Configure how testers interact with this model</Card.Description>
		</Card.Header>
		<Card.Content class="w-full space-y-2">
			<Form.Field {form} name="api_key">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>API Key</Form.Label>
						{#if data.apiKeys.length === 0}
							<div class="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 w-fit">
								<span class="text-sm text-muted-foreground">No API keys found. <a href="/dashboard/keys/create" class="text-primary hover:underline">Create one first</a>.</span>
							</div>
						{:else}
							<Select.Root type="single" bind:value={$formData.api_key} name={props.name}>
								<Select.Trigger {...props} class="w-[180px]">
									{data.apiKeys.find((key) => key.id === $formData.api_key)?.name ?? 'Select an API key...'}
								</Select.Trigger>
								<Select.Content>
									{#each data.apiKeys as apiKey (apiKey.id)}
										<Select.Item value={apiKey.id} label={apiKey.name} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/if}
					{/snippet}
				</Form.Control>
				<Form.Description class="text-xs"
					>Select an API key to use with this model configuration.</Form.Description
				>
				<Form.FieldErrors />
			</Form.Field>
			<!-- <div class="flex flex-row items-center justify-between rounded-lg border p-4">
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
			</div> -->
		</Card.Content>
	</Card.Root>

	{#if dev}
		<SuperDebug data={formData} />
	{/if}
</form>
