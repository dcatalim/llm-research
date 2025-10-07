<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import KeyBox from './key-box.svelte';
	import NoKeysFound from './no-keys-found.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	let { data }: PageProps = $props();

	async function handleDelete(keyId: string) {
		const formData = new FormData();
		formData.append('id', keyId);

		const response = await fetch('?/delete', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			toast.success('API key deleted successfully');
			// Reload the page to refresh the list
			window.location.reload();
		} else {
			toast.error('Failed to delete API key');
		}
	}
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

<div class="flex flex-col w-full items-center justify-center">
	{#await data.apiKeys}
		<Spinner />
	{:then apiKeys}
		{#if apiKeys?.length > 0}
			<div class="flex w-full flex-col gap-2">
				{#each apiKeys as apiKey (apiKey.id)}
					<KeyBox {apiKey} onDelete={handleDelete} />
				{/each}
			</div>
		{:else}
			<NoKeysFound />
		{/if}
	{:catch error}
		{error.message}
	{/await}
</div>
