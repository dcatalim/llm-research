<script lang="ts">
	import type { Chat } from '@ai-sdk/svelte';
	import { Button } from './ui/button';
	import { fly } from 'svelte/transition';
	import { replaceState } from '$app/navigation';
	import type { User } from '$lib/pocketbase';

	let { user, chatClient, model }: { user: User | undefined; chatClient: Chat; model: any } =
		$props();
</script>

<div class="grid w-full gap-2 sm:grid-cols-2">
	{#each model.suggestedMessages as suggestedAction, i (suggestedAction)}
		<div
			in:fly|global={{ opacity: 0, y: 20, delay: 50 * i, duration: 400 }}
			class={i > 1 ? 'hidden sm:block' : 'block'}
		>
			<Button
				variant="ghost"
				onclick={async () => {
					if (user) {
						replaceState(`/chat/${chatClient.id}`, {});
					}
					await chatClient.sendMessage({
						role: 'user',
						parts: [{ type: 'text', text: suggestedAction }]
					});
				}}
				class="h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col"
			>
				<span class="font-medium text-wrap">{suggestedAction}</span>
			</Button>
		</div>
	{/each}
</div>
