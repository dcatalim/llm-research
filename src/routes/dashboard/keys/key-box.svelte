<script lang="ts">
	import * as Item from '$lib/components/ui/item/index.js';
	import * as Button from '$lib/components/ui/button/index.js';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import KeyIcon from '@lucide/svelte/icons/key';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';

	let { apiKey, onDelete } = $props<{ apiKey: any; onDelete?: (id: string) => void }>();

	let showDeleteDialog = $state(false);
</script>

<Item.Root variant="outline">
	<Item.Content>
		<div class="flex items-center gap-2">
			<KeyIcon class="h-4 w-4 text-muted-foreground" />
			<Item.Title>{apiKey.name}</Item.Title>
		</div>
		<Item.Description>
			{apiKey.provider} • Added {new Date(apiKey.created).toLocaleDateString()}
		</Item.Description>
	</Item.Content>
	<Item.Actions>
		<AlertDialog.Root bind:open={showDeleteDialog}>
			<AlertDialog.Trigger>
				<Button.Root variant="outline" size="sm">
					<Trash2Icon class="h-4 w-4" />
					Delete
				</Button.Root>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Delete API Key?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will permanently delete your API key "{apiKey.name}".
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action
						onclick={() => {
							if (onDelete) onDelete(apiKey.id);
						}}
					>
						Delete
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</Item.Actions>
</Item.Root>
