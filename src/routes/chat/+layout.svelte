<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { ChatHistory } from '$lib/hooks/chat-history.svelte.js';
	import { createAIContext } from '@ai-sdk/svelte';

	let { data, children } = $props();

	const chatHistory = new ChatHistory(data.chats);
	chatHistory.setContext();
	
	createAIContext();
	// all hooks created after this or in components that are children of this component
	// will have synchronized state
</script>

<Sidebar.Provider open={!data.sidebarCollapsed}>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>{@render children?.()}</Sidebar.Inset>
</Sidebar.Provider>
