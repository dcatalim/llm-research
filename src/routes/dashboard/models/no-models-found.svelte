<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import FolderCodeIcon from '@lucide/svelte/icons/folder-code';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<FolderCodeIcon />
		</Empty.Media>
		<Empty.Title>No Models Yet</Empty.Title>
		<Empty.Description>
			You haven't created any models yet. Get started by creating your first model.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<div class="flex gap-2">
			<Button.Root href="/dashboard/models/create">Create Model</Button.Root>
			<Button.Root onclick={() => window.history.back()} variant="outline">Go back</Button.Root>
		</div>
	</Empty.Content>
	<!-- <Button.Root variant="link" class="text-muted-foreground" size="sm">
		<a href="#/">
			Learn More <ArrowUpRightIcon class="inline" />
		</a>
	</Button.Root> -->
</Empty.Root>
