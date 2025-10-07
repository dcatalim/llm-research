<script lang="ts">
	import * as Empty from '$lib/components/ui/empty';
	import * as Button from '$lib/components/ui/button';
	import KeyIcon from '@lucide/svelte/icons/key';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<KeyIcon />
		</Empty.Media>
		<Empty.Title>No API Keys</Empty.Title>
		<Empty.Description>
			Get started by adding your first API key. Your keys will be encrypted before storage.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<div class="flex gap-2">
			<Button.Root href="/dashboard/keys/create">Add Your First Key</Button.Root>
			<Button.Root onclick={() => window.history.back()} variant="outline">Go back</Button.Root>
		</div>
	</Empty.Content>
</Empty.Root>
