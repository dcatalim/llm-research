<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import ModelBox from './model-box.svelte';
	import NoModelsFound from './no-models-found.svelte';
	let { data }: PageProps = $props();
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Recent Configurations</h1>
		<p class="text-muted-foreground">Your latest LLM model configurations</p>
	</div>
	<div class="flex gap-2">
		<Button href="/dashboard/models/create">
			<Plus />
			Add New Model
		</Button>
	</div>
</div>

<div class="flex flex-col w-full items-center justify-center">
	{#await data.models}
		<Spinner />
	{:then models}
		{#if models?.length > 0}
			<div class="flex w-full flex-col gap-2">
				{#each models as model (model.id)}
					<ModelBox {model} />
				{/each}
			</div>
		{:else}
			<NoModelsFound />
		{/if}
	{:catch error}
		{error.message}
	{/await}
</div>
