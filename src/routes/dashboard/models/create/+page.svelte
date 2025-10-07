<script lang="ts">
	import ModelForm from '$lib/components/model-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<ModelForm {data}></ModelForm>
