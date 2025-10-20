<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
    import type { LayoutProps } from './$types';
	import { ChatHistory } from '$lib/hooks/chat-history.svelte.js';

    let { data, children }: LayoutProps = $props();

	const chatHistory = new ChatHistory(data.chats);
	chatHistory.setContext();
	// data.selectedChatModel.setContext();
</script>

<Sidebar.Provider open={!data.sidebarCollapsed}>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>{@render children?.()}</Sidebar.Inset>
</Sidebar.Provider>
