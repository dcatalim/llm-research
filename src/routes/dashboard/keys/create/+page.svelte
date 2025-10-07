<script lang="ts">
	import NewKeyForm from './new-key-form.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<NewKeyForm {data}></NewKeyForm>
