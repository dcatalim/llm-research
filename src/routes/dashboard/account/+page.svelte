<script lang="ts">
	import SuperDebug from 'sveltekit-superforms';
	import type { PageProps } from './$types';
	import UserForm from './user-form.svelte';

	let { data }: PageProps = $props();
</script>

<SuperDebug data={data.user} />

<!-- <UserForm {data} /> -->
