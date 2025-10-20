<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import DashboardSidebar from '$lib/components/dashboard-sidebar.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider open={!data.sidebarCollapsed}>
	<DashboardSidebar user={data.user} />
	<main class="flex h-screen w-full flex-col gap-4 p-4">
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>
