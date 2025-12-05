<script lang="ts">
	import { filesProxy, superForm } from 'sveltekit-superforms';
	import ModelForm from '../model-form.svelte';
	import type { PageProps } from './$types';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { modelConfigurationSchema } from '$lib/schemas';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

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

	const { capture, restore } = form;
	
	export const snapshot = { capture, restore };


</script>

<ModelForm {form} apiKeys={data.apiKeys}></ModelForm>
