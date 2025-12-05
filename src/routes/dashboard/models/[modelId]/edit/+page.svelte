<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { modelConfigurationSchema } from '$lib/schemas';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import ModelForm from '../../model-form.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	let { data }: PageProps = $props();

	const form = superForm(data.form, {
		dataType: 'json',
		resetForm: false,
		validators: zod4Client(modelConfigurationSchema),
		onUpdated({ form }) {
			if (form.message) {
				if (form.valid) {
					toast.success(form.message);
					goto('/dashboard/models');
				} else {
					toast.error(form.message);
					console.error('Form submission error:', form.errors);
				}
			}
		}
	});

	let open = $state(data.chats.length > 0);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				{#if data.chats.length === 1}
					This model already has 1 associated chat. Editing the model may change or break that
					chat's behavior.
				{:else}
					This model already has {data.chats.length} associated chats. Editing the model may change or
					break those chats' behavior.
				{/if}

				<p class="mt-3 font-semibold">
					This action cannot be undone. Changes will apply to all associated chats.
				</p>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => history.back()}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={() => (open = false)}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<ModelForm {form} apiKeys={data.apiKeys}></ModelForm>
