<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Key, Box, ArrowRight, Info } from '@lucide/svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-6">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Welcome to LLM Research</h1>
		<p class="text-muted-foreground">Configure, share and test LLMs with ease</p>
	</div>

	<Alert.Root>
		<Info class="size-4" />
		<Alert.Title>Getting Started</Alert.Title>
		<Alert.Description>
			Please create an API key first before creating a model. Keys are required to authenticate and
			use your models.
		</Alert.Description>
	</Alert.Root>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<Card.Root class="group transition-all hover:shadow-md cursor-pointer">
			<Card.Header>
				<div class="flex items-center gap-3">
					<div class="p-2 rounded-lg bg-primary/10">
						<Key class="size-6 text-primary" />
					</div>
					<div>
						<Card.Title>API Keys</Card.Title>
						<Card.Description>Manage your API keys</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">
					Create and manage API keys to authenticate your requests. Keys are required for model
					creation and usage.
				</p>
			</Card.Content>
			<Card.Footer>
				<Button href="/dashboard/keys" variant="outline" class="w-full group-hover:bg-accent">
					Go to Keys
					<ArrowRight class="size-4" />
				</Button>
			</Card.Footer>
		</Card.Root>

		<Card.Root class="group transition-all hover:shadow-md cursor-pointer">
			<Card.Header>
				<div class="flex items-center gap-3">
					<div class="p-2 rounded-lg bg-primary/10">
						<Box class="size-6 text-primary" />
					</div>
					<div>
						<Card.Title>Models</Card.Title>
						<Card.Description>Configure your LLM models</Card.Description>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">
					Set up and configure your language models. Test different configurations and share them
					with others.
				</p>
			</Card.Content>
			<Card.Footer>
				<Button href="/dashboard/models" variant="outline" class="w-full group-hover:bg-accent">
					Go to Models
					<ArrowRight class="size-4" />
				</Button>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
