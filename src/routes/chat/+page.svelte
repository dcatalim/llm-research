<script lang="ts">
	import type { PageProps } from './$types';
	import Chat from '$lib/components/chat.svelte';

	let { data }: PageProps = $props();

</script>

<Chat chat={undefined} initialMessages={[]} readonly={false} user={data.user} model={data.model} />
