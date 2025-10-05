<script lang="ts">
	import type { PageProps } from './$types';
	import { Button } from '$lib/components/ui/button';
	import Plus from '@lucide/svelte/icons/plus';
	
	let { data }: PageProps = $props();
</script>

<div class="flex w-full justify-end">
	<Button href="/dashboard/models/create">
		<Plus />
		Add New Model
	</Button>
</div>
