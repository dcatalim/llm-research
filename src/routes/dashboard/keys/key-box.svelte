<script lang="ts">
	import type { Writable } from 'svelte/store';
	import * as Item from '$lib/components/ui/item/index.js';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import KeyIcon from '@lucide/svelte/icons/key';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';

	let { apiKey, data } = $props<{
		apiKey: any;
	}>();

	let showDeleteDialog = $state(false);

	const form = superForm(data.form, {
		clearOnSubmit: 'errors',
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
				} else {
					toast.error(form.message);
				}
			}
		}
	});

	const { enhance, submitting, formId } = form;
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
			<AlertDialog.Trigger class={buttonVariants({ variant: 'outline' })}>
				<Trash2Icon class="h-4 w-4" />
				Delete
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
					<form method="POST" action="?/delete" use:enhance>
						<AlertDialog.Action
							formaction="?/delete"
							type="submit"
							class={buttonVariants({ variant: 'destructive' })}
							name="id"
							value={apiKey.id}
							disabled={$submitting && $formId !== apiKey.id}
							onclick={() => ($formId = $submitting ? $formId : apiKey.id)}
							>{#if $submitting && $formId === apiKey.id}
								<Trash2Icon class="h-4 w-4 animate-spin" />
								Deleting...
							{:else}
								<Trash2Icon class="h-4 w-4" />
								Delete
							{/if}</AlertDialog.Action
						>
					</form>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</Item.Actions>
</Item.Root>
