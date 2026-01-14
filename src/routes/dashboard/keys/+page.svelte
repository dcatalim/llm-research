<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import KeyBox from './key-box.svelte';
	import NoKeysFound from './no-keys-found.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { apiKeyDeleteSchema } from '$lib/schemas';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-3xl font-bold text-foreground">API Keys</h1>
		<p class="text-muted-foreground">Manage your encrypted API keys</p>
	</div>
	<div class="flex gap-2">
		<Button href="/dashboard/keys/create">
			<Plus />
			Add New Key
		</Button>
	</div>
</div>

<div class="flex w-full flex-col items-center justify-center">
	{#await data.apiKeys}
		<Spinner />
	{:then apiKeys}
		{#if apiKeys?.length > 0}
			<div class="flex w-full flex-col gap-2">
				{#each apiKeys as apiKey (apiKey.id)}
					<KeyBox {apiKey} {data} />
				{/each}
			</div>
		{:else}
			<NoKeysFound />
		{/if}
	{:catch error}
		{error.message}
	{/await}
</div>
