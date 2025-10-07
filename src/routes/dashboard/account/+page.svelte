<script lang="ts">
	import type { PageProps } from './$types';
	import UserForm from './user-form.svelte';

	let { data }: PageProps = $props();
</script>

{JSON.stringify(data.user)}

<UserForm {data} />
