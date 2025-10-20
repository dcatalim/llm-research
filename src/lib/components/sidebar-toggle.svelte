<script>
	import PanelLeftIcon from '@lucide/svelte/icons/panel-left';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { Button } from '$lib/components/ui/button';

	import * as Tooltip from '$lib/components/ui/tooltip';

	const sidebar = useSidebar();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					onclick={() => {
						sidebar.toggle();
					}}
					variant="outline"
					class="md:h-fit md:px-2"
				>
					<PanelLeftIcon />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content align="start">Toggle Sidebar</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
