<script lang="ts">
	import type { FileUIPart } from 'ai';
	import LoaderIcon from '@lucide/svelte/icons/loader';

	let {
		file,
		uploading = false
	}: {
		file: FileUIPart;
		uploading?: boolean;
	} = $props();
	
	const { type, mediaType, filename, url } = $derived(file);
	
	const fileExtension = $derived(() => {
		if (!filename) return '';
		const parts = filename.split('.');
		return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
	});
</script>

<div class="flex flex-col gap-2">
	<div
		class="relative flex aspect-video h-16 w-20 flex-col items-center justify-center rounded-md bg-muted"
	>
		{#if mediaType && mediaType.startsWith('image')}
			<img
				src={url}
				alt={filename ?? 'An image attachment'}
				class="size-full rounded-md object-cover"
			/>
		{:else}
			<div class="max-w-16 truncate text-sm">{fileExtension()}</div>
		{/if}

		{#if uploading}
			<div class="absolute animate-spin text-zinc-500">
				<LoaderIcon />
			</div>
		{/if}
	</div>
	<div class="max-w-16 truncate text-xs text-zinc-500">{filename}</div>
</div>
