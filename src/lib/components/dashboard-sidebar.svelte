<script lang="ts">
	import KeyIcon from '@lucide/svelte/icons/key';
	import HouseIcon from '@lucide/svelte/icons/house';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Logo from './Logo.svelte';
	import { getContext } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { User } from '$lib/pocketbase';
	import { Button } from '$lib/components/ui/button/index.js';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SidebarUserNav from './sidebar-user-nav.svelte';

	let { user }: { user?: User } = $props();

	const context = Sidebar.useSidebar();

	// Menu items.
	const items = [
		{
			title: 'Home',
			url: '/dashboard/',
			icon: HouseIcon
		},
		{
			title: 'Models',
			url: '/dashboard/models',
			icon: SettingsIcon
		},
		{
			title: 'Keys',
			url: '/dashboard/keys',
			icon: KeyIcon
		}
		// {
		// 	title: 'Search',
		// 	url: '#',
		// 	icon: SearchIcon
		// },
		// {
		// 	title: 'Settings',
		// 	url: '#',
		// 	icon: SettingsIcon
		// }
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<div class="flex h-10 flex-row items-center justify-between md:h-[34px]">
				<a
					href="/dashboard/"
					onclick={() => {
						context.setOpenMobile(false);
					}}
					class="flex flex-row items-center gap-3"
				>
					<span class="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted">
						LLM Research
					</span>
				</a>
			</div>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a
										href={item.url}
										onclick={() => {
											context.setOpenMobile(false);
										}}
										{...props}
									>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

    
	<Sidebar.Footer>
		{#if user}
			<SidebarUserNav {user} />
		{/if}
	</Sidebar.Footer>
</Sidebar.Root>
