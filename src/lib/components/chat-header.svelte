<script lang="ts">
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import SidebarToggle from './sidebar-toggle.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Button } from './ui/button';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { goto } from '$app/navigation';
	// import ModelSelector from './model-selector.svelte';
	import type { Chat, User } from '$lib/pocketbase';
	let {
		user,
		chat,
		readonly,
		model
	}: {
		user: User | undefined;
		chat: Chat | undefined;
		readonly: boolean;
		model: any;
	} = $props();

	const sidebar = useSidebar();
</script>

<header class="sticky top-0 flex items-center gap-2 bg-background p-2">
	<!-- <SidebarToggle /> -->

	<!-- {#if !sidebar?.open || (innerWidth.current ?? 768) < 768}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							class="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
							onclick={() => {
								goto('/', {
									invalidateAll: true
								});
							}}
						>
							<PlusIcon />
							<span class="md:sr-only">New Chat</span>
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>New Chat</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/if} -->

	<!-- {#if !readonly}
		<ModelSelector class="order-1 md:order-2" />
	{/if} -->

	<!-- {#if !readonly && chat}
		<VisibilitySelector {chat} class="order-1 md:order-3" />
	{/if} -->

	<!-- {#if !user}
		<Button href="/signin" class="order-5 px-2 py-1.5 md:h-[34px]">Sign In</Button>
	{/if} -->
</header>
