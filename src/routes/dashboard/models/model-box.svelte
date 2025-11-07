<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import Trash_2 from '@lucide/svelte/icons/trash-2';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { CopyButton } from '$lib/components/ui/copy-button';
	import { page } from '$app/state';
	import Share_2 from '@lucide/svelte/icons/share-2';

	let { model } = $props();
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);
</script>

<Item.Root variant="outline">
	<Item.Content>
		<Item.Title
			>{model.name}
			<CopyButton text="{page.url.origin}/share/{model.id}" onCopy={() => toast.success('Model link copied to clipboard')}>
				{#snippet icon()}
					<Share_2 />
				{/snippet}
			</CopyButton>
		</Item.Title>
		<Item.Description>{model.provider}:{model.version}</Item.Description>
	</Item.Content>
	<Item.Actions>
		<Button href={`/dashboard/models/${model.id}/edit`} variant="outline" size="sm">Edit</Button>
		<Button size="sm" onclick={() => (showDeleteDialog = true)} disabled={isDeleting}>
			<Trash_2 />
		</Button>
	</Item.Actions>
</Item.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Model</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{model.name}"? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<form
				method="POST"
				action="?/delete"
				use:enhance={({ formData }) => {
					formData.append('id', model.id);
					isDeleting = true;

					return async ({ result, update }) => {
						isDeleting = false;
						showDeleteDialog = false;

						if (result.type === 'success') {
							toast.success('Model deleted successfully');
							await update();
						} else if (result.type === 'failure') {
							const message = (result.data as any)?.message || 'Failed to delete model';
							toast.error(message);
						}
					};
				}}
			>
				<AlertDialog.Action type="submit" disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Delete'}
				</AlertDialog.Action>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
