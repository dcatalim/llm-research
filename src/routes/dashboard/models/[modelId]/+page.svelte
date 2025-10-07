<script lang="ts">
    import type { PageProps } from './$types';
    import Pencil from '@lucide/svelte/icons/pencil'
    import { Button } from "$lib/components/ui/button"
    
    let { data }: PageProps = $props();

    const modelStream = data.model;

</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Model</h1>
		<p class="text-muted-foreground">Your latest LLM model configurations</p>
	</div>
	<div class="flex gap-2">
		<Button href="/dashboard/models/create">
			<Pencil />
			Add New Model
		</Button>
	</div>
</div>

<div>
    {#await modelStream}
        <p>Loading model details...</p>
    {:catch error}
        <p class="text-red-500">Error loading model: {error.message}</p>

    {:then model }
        {#if model}
        <h2 class="text-2xl font-semibold mt-6 mb-4">Model Details</h2>
        <div class="p-4 border rounded-lg shadow-sm">
            <p><strong>Name:</strong> {model.name}</p>
            <p><strong>Description:</strong> {model.description}</p>
            <p><strong>Type:</strong> {model.type}</p>
            <p><strong>Created At:</strong> {new Date(model.created).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(model.updated).toLocaleString()}</p>
            <!-- Add more model fields as necessary -->
        </div>
        
    {:else}
        <p>No model data available.</p>
    {/if}
    {/await}
</div>
