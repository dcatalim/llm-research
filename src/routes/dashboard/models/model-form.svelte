<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import SuperDebug, {
	fileProxy,
		filesFieldProxy
	} from 'sveltekit-superforms';
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
	import { TagsInput } from '$lib/components/ui/tags-input';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { form, apiKeys }: { form: any; apiKeys: any[] } = $props();

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

	$effect(() => {
		if (selectedModelId) {
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

	// const files = filesFieldProxy(form, 'files');
	// const { values, valueErrors } = files;

</script>

<form method="POST" class="flex flex-col gap-4" enctype="multipart/form-data" use:enhance>
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
							<Input
								{...props}
								autofocus
								placeholder="My Research Assistant"
								bind:value={$formData.name}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="instructions">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>User Instructions</Form.Label>
							<Textarea
								{...props}
								placeholder="Explain the purpose of this model to testers..."
								class="min-h-32 bg-background"
								bind:value={$formData.instructions}
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

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
						>Select a model from OpenRouter's available models.
						<br />
						Please note that some models don't support all parameters.
					</Form.Description>
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

				<!-- <Form.Field {form} name="files">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Files</Form.Label>
							
							<Input
								type="file"
								multiple
								name="files"
								accept="image/png, image/jpeg, application/pdf, text/plain"
								bind:files={$values}
							/>
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Add some files to provide additional context for the model.</Form.Description
					>
					<Form.FieldErrors />
				</Form.Field> -->
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Advanced Parameters</Card.Title>
				<Card.Description>Hover over the parameter's name to see an explanation</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-4">
				<Form.Field {form} name="temperature">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Temperature',
									'This setting influences the variety in the model’s responses. Lower values lead to more predictable and typical responses, while higher values encourage more diverse and less common responses. At 0, the model always gives the same response for a given input.'
								)}
								<!-- <Form.Label>Temperature</Form.Label> -->

								<span class="text-sm text-muted-foreground">{$formData.temperature}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.temperature} />
							<Slider
								type="single"
								{...props}
								bind:value={$formData.temperature}
								min={0}
								max={2}
								step={0.1}
							/>
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs"
						>Controls randomness. Lower is more focused, higher is more creative.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="topP">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Top P',
									'This setting limits the model’s choices to a percentage of likely tokens: only the top tokens whose probabilities add up to P. A lower value makes the model’s responses more predictable, while the default setting allows for a full range of token choices. Think of it like a dynamic Top-K.'
								)}
								<!-- <Form.Label>Top P</Form.Label> -->
								<span class="text-sm text-muted-foreground">{$formData.topP}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.topP} />

							<Slider
								type="single"
								{...props}
								bind:value={$formData.topP}
								min={0}
								max={1}
								step={0.05}
							/>
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs"
						>Nucleus sampling threshold for token selection.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="topK">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Top K',
									'This limits the model’s choice of tokens at each step, making it choose from a smaller set. A value of 1 means the model will always pick the most likely next token, leading to predictable results. By default this setting is disabled, making the model to consider all choices.'
								)}
								<!-- <Form.Label>Top K</Form.Label> -->
								<span class="text-sm text-muted-foreground">{$formData.topK}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.topK} />

							<Slider type="single" {...props} bind:value={$formData.topK} min={0} step={0.05} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs"
						>Nucleus sampling threshold for token selection.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="frequencyPenalty">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Frequency Penalty',
									'This setting aims to control the repetition of tokens based on how often they appear in the input. It tries to use less frequently those tokens that appear more in the input, proportional to how frequently they occur. Token penalty scales with the number of occurrences. Negative values will encourage token reuse.'
								)}
								<!-- <Form.Label>Frequency Penalty</Form.Label> -->
								<span class="text-sm text-muted-foreground">{$formData.frequencyPenalty}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.frequencyPenalty} />

							<Slider
								type="single"
								{...props}
								bind:value={$formData.frequencyPenalty}
								min={-2}
								max={2}
								step={0.1}
							/>
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs">Reduces repetition of token sequences.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="presencePenalty">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Presence Penalty',
									'Adjusts how often the model repeats specific tokens already used in the input. Higher values make such repetition less likely, while negative values do the opposite. Token penalty does not scale with the number of occurrences. Negative values will encourage token reuse.'
								)}
								<!-- <Form.Label>Presence Penalty</Form.Label> -->
								<span class="text-sm text-muted-foreground">{$formData.presencePenalty}</span>
							</div>
							<input type="hidden" {...props} bind:value={$formData.presencePenalty} />

							<Slider
								type="single"
								{...props}
								bind:value={$formData.presencePenalty}
								min={-2}
								max={2}
								step={0.1}
							/>
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs">Reduces repetition of token sequences.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="maxTokens">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex items-center justify-between">
								{@render explanationTooltip(
									'Max Tokens',
									'This sets the upper limit for the number of tokens the model can generate in response. It won’t produce more than this limit. The maximum value is the context length minus the prompt length.'
								)}
								<!-- <Form.Label>Max Tokens</Form.Label> -->
							</div>

							<Input {...props} type="number" min="1" bind:value={$formData.maxTokens} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description class="text-xs"
						>Maximum length of the generated response.</Form.Description
					> -->
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="stopSequences">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Stop Sequences</Form.Label>

							<TagsInput
								{...props}
								bind:value={$formData.stopSequences}
								placeholder="Add a message"
							/>
						{/snippet}
					</Form.Control>
					<Form.Description class="text-xs"
						>Sequences that will stop the generation when encountered.</Form.Description
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
		<Card.Content class="w-full space-y-4">
			<Form.Field {form} name="apiKey">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>API Key</Form.Label>
						{#if apiKeys.length === 0}
							<div
								class="flex w-fit items-center gap-2 rounded-md border border-input bg-background px-3 py-2"
							>
								<span class="text-sm text-muted-foreground"
									>No API keys found. <a
										href="/dashboard/keys/create"
										class="text-primary hover:underline">Create one first</a
									>.</span
								>
							</div>
						{:else}
							<Select.Root type="single" bind:value={$formData.apiKey} name={props.name}>
								<Select.Trigger {...props} class="w-[180px]">
									{apiKeys.find((key) => key.id === $formData.apiKey)?.name ??
										'Select an API key...'}
								</Select.Trigger>
								<Select.Content>
									{#each apiKeys as apiKey (apiKey.id)}
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

			<Form.Field {form} name="suggestedMessages">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Suggested Messages</Form.Label>

						<TagsInput
							{...props}
							bind:value={$formData.suggestedMessages}
							placeholder="Add a message"
						/>

						<!-- <Input {...props} placeholder="Tell me fun facts about the moon" bind:value={$formData.name} /> -->
					{/snippet}
				</Form.Control>
				<Form.Description class="text-xs"
					>Suggest some first interactions for the user.</Form.Description
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

{#snippet explanationTooltip(name: string, explanation: string)}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger class="flex items-center gap-1">
				<Form.Label>{name}</Form.Label>
				<!-- <CircleQuestionMark size={16} class="text-muted-foreground" /> -->
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="max-w-sm text-justify">
					{explanation}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/snippet}
