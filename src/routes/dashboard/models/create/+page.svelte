<script lang="ts">
	import type { PageProps } from './$types';
	import CreateModelForm from './create-model-form.svelte';

	let { data }: PageProps = $props();
</script>

<CreateModelForm {data} ></CreateModelForm>