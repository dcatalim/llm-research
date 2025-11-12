<script lang="ts">
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-3xl font-bold text-foreground">LLM Research</h1>
		<p class="text-muted-foreground">The platform to configure, share and test LLMs</p>
	</div>
	<div class="flex gap-2">
		<!-- <Button href="/dashboard/models/create">
			<Plus />
			Add New Model
		</Button> -->
	</div>
</div>