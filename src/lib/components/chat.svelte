<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { toast } from 'svelte-sonner';
	import type { Chat as DbChat, User } from '$lib/pocketbase';
	import Messages from './messages.svelte';
	import MultimodalInput from './multimodal-input.svelte';
	import type { UIMessage } from '@ai-sdk/svelte';
	import type { FileUIPart } from 'ai';

	let {
		user,
		chat,
		readonly,
		initialMessages,
		model
	}: {
		user: User | undefined;
		chat: DbChat | undefined;
		initialMessages: UIMessage[];
		readonly: boolean;
		model: any;
	} = $props();


	const chatClient = $derived(
		new Chat({
			id: chat?.id,
			// This way, the client is only recreated when the ID changes, allowing us to fully manage messages
			// clientside while still SSRing them on initial load or when we navigate to a different chat.
			messages: initialMessages,
			generateId: crypto.randomUUID.bind(crypto),
			// onFinish: async () => {
			// 	await chatHistory.refetch();
			// },
			onError: (error) => {
				let message = 'An error occurred while generating the response.';
				try {
					// If there's an API error, its message will be JSON-formatted
					const jsonError = JSON.parse(error.message);
					console.log(jsonError);
					if (
						typeof jsonError === 'object' &&
						jsonError !== null &&
						'message' in jsonError &&
						typeof jsonError.message === 'string'
					) {
						message = jsonError.message;
					} else {
						message = error.message;
					}
				} catch {
					message = error.message;
				}

				toast.error(message, {
					action: {
						label: 'Retry',
						onClick: () => chatClient.regenerate()
					}
				});
			}
		})
	);

	let files = $state<FileUIPart[]>([]);
</script>

<div class="flex h-dvh min-w-0 flex-col bg-background">
	<!-- <ChatHeader {user} {chat} {readonly} {model} /> -->
	 
	<Messages
		{readonly}
		loading={chatClient.status === 'streaming' || chatClient.status === 'submitted'}
		messages={chatClient.messages}
		{model}
	/>

	<form class="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
		{#if !readonly}
			<MultimodalInput {files} {user} {chatClient} {model} class="flex-1" />
		{/if}
	</form>
</div>
