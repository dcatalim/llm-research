<script lang="ts">
	import type { Chat } from '@ai-sdk/svelte';
	// import PreviewAttachment from './preview-attachment.svelte';
	import { Textarea } from "$lib/components/ui/textarea"	
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { LocalStorage } from '$lib/hooks/local-storage.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { toast } from 'svelte-sonner';
	import { Button } from "$lib/components/ui/button"
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import StopIcon from '@lucide/svelte/icons/circle-stop';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import SuggestedActions from './suggested-actions.svelte';
	import { replaceState } from '$app/navigation';
	import type { User } from '$lib/pocketbase';

	// Extended FilePart type to include optional name property
	type FileAttachment = {
		type: 'file';
		data: string;
		mediaType: string;
		name?: string;
	};

	let {
		attachments = $bindable(),
		user,
		chatClient,
		class: c
	}: {
		attachments: FileAttachment[];
		user: User | undefined;
		chatClient: Chat;
		class?: string;
	} = $props();

	let mounted = $state(false);
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let uploadQueue = $state<string[]>([]);
	const storedInput = new LocalStorage('input', '');
	const loading = $derived(chatClient.status === 'streaming' || chatClient.status === 'submitted');

	const adjustHeight = () => {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = `${textareaRef.scrollHeight + 2}px`;
		}
	};

	const resetHeight = () => {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = '98px';
		}
	};

	let input = $state('');

	function setInput(value: string) {
		input = value;
		adjustHeight();
	}

	async function submitForm(event?: Event) {
		if (user) {
			replaceState(`/chat/${chatClient.id}`, {});
		}

		// Convert FileParts to the format expected by sendMessage
		const files = attachments.map(part => ({
			type: 'file' as const,
			filename: part.name || 'file',
			mediaType: part.mediaType,
			url: part.data
		}));

		await chatClient.sendMessage({
			text: input,
			files: files.length > 0 ? files : undefined
		});

		input = '';
		attachments = [];
		resetHeight();

		if (innerWidth.current && innerWidth.current > 768) {
			textareaRef?.focus();
		}
	}

	async function uploadFile(file: File): Promise<FileAttachment | undefined> {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/files/upload', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const data = await response.json();
				const { url, pathname, contentType } = data;

				return {
					type: 'file',
					data: url,
					mediaType: contentType,
					name: pathname
				};
			}
			const { message } = await response.json();
			toast.error(message);
		} catch {
			toast.error('Failed to upload file, please try again!');
		}
	}

	async function handleFileChange(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const files = Array.from(event.currentTarget.files || []);
		uploadQueue = files.map((file) => file.name);

		try {
			const uploadPromises = files.map((file) => uploadFile(file));
			const uploadedAttachments = await Promise.all(uploadPromises);
			const successfullyUploadedAttachments = uploadedAttachments.filter(
				(attachment) => attachment !== undefined
			);

			attachments = [...attachments, ...successfullyUploadedAttachments];
		} catch (error) {
			console.error('Error uploading files!', error);
		} finally {
			uploadQueue = [];
		}
	}

	onMount(() => {
		input = storedInput.value;
		adjustHeight();
		mounted = true;
	});

	$effect.pre(() => {
		storedInput.value = input;
	});
</script>

<div class="relative flex w-full flex-col gap-4">
	{#if mounted && chatClient.messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0}
		<SuggestedActions {user} {chatClient} />
	{/if}

	<input
		type="file"
		class="pointer-events-none fixed -top-4 -left-4 size-0.5 opacity-0"
		bind:this={fileInputRef}
		multiple
		onchange={handleFileChange}
		tabIndex={-1}
	/>

	<!-- {#if attachments.length > 0 || uploadQueue.length > 0}
		<div class="flex flex-row items-end gap-2 overflow-x-scroll">
			{#each attachments as attachment (attachment.url)}
				<PreviewAttachment {attachment} />
			{/each}

			{#each uploadQueue as filename (filename)}
				<PreviewAttachment
					attachment={{
						url: '',
						name: filename,
						contentType: ''
					}}
					uploading
				/>
			{/each}
		</div>
	{/if} -->

	<Textarea
		bind:ref={textareaRef}
		placeholder="Send a message..."
		bind:value={() => input, setInput}
		class={cn(
			'bg-muted max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl pb-10 !text-base dark:border-zinc-700',
			c
		)}
		rows={2}
		autofocus
		onkeydown={(event) => {
			if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
				event.preventDefault();

				if (loading) {
					toast.error('Please wait for the model to finish its response!');
				} else {
					submitForm();
				}
			}
		}}
	/>

	<div class="absolute bottom-0 flex w-fit flex-row justify-start p-2">
		{@render attachmentsButton()}
	</div>

	<div class="absolute right-0 bottom-0 flex w-fit flex-row justify-end p-2">
		{#if loading}
			{@render stopButton()}
		{:else}
			{@render sendButton()}
		{/if}
	</div>
</div>

{#snippet attachmentsButton()}
	<Button
		class="h-fit rounded-md rounded-bl-lg p-[7px] hover:bg-zinc-200 dark:border-zinc-700 hover:dark:bg-zinc-900"
		onclick={(event) => {
			event.preventDefault();
			fileInputRef?.click();
		}}
		disabled={loading}
		variant="ghost"
	>
		<PaperclipIcon size={14} />
	</Button>
{/snippet}

{#snippet stopButton()}
	<Button
		class="h-fit rounded-full border p-1.5 dark:border-zinc-600"
		onclick={(event) => {
			event.preventDefault();
			stop();
			chatClient.messages = chatClient.messages;
		}}
	>
		<StopIcon size={14} />
	</Button>
{/snippet}

{#snippet sendButton()}
	<Button
		class="h-fit rounded-full border p-1.5 dark:border-zinc-600"
		onclick={(event) => {
			event.preventDefault();
			submitForm();
		}}
		disabled={input.length === 0 || uploadQueue.length > 0}
	>
		<ArrowUpIcon size={14} />
	</Button>
{/snippet}
