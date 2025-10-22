<script lang="ts">
	import type { PageProps } from './$types';
	import Chat from '$lib/components/chat.svelte';
	import { convertToUIMessages } from '$lib/utils/chat';

	let { data }: PageProps = $props();

	let updatedChat = data.chat ?? {};
	updatedChat.id = data.chat?.uuid; // Ensure chat has 'id' field for Chat component
</script>

<Chat
	chat={data.chat}
	initialMessages={convertToUIMessages(data.messages)}
	readonly={data.user?.id !== data.chat?.userId}
	user={data.user}
/>
