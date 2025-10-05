<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main class="flex w-full h-screen flex-col gap-4 p-4">
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>
