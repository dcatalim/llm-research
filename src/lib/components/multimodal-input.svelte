<script lang="ts">
	import type { Chat } from '@ai-sdk/svelte';
	import PreviewAttachment from './preview-attachment.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';
	import { LocalStorage } from '$lib/hooks/local-storage.svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import PaperclipIcon from '@lucide/svelte/icons/paperclip';
	import StopIcon from '@lucide/svelte/icons/circle-stop';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import SuggestedActions from './suggested-actions.svelte';
	import { replaceState } from '$app/navigation';
	import { getImageURL, type User } from '$lib/pocketbase';
	import type { FileUIPart } from 'ai';

	let {
		files = $bindable(),
		user,
		chatClient,
		model,
		class: c
	}: {
		files: FileUIPart[];
		user: User | undefined;
		chatClient: Chat;
		model: any;
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
		// Add validation check
		if (input.trim().length === 0) {
			input = input.trim();
			return;
		}

		if (user) {
			replaceState(`/chat/${chatClient.id}`, {});
		}

		await chatClient.sendMessage({
			text: input,
			files: files.length > 0 ? files : undefined
		});

		input = '';
		files = [];
		resetHeight();

		if (innerWidth.current && innerWidth.current > 768) {
			textareaRef?.focus();
		}
	}

	async function uploadFile(file: File): Promise<FileUIPart | undefined> {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const response = await fetch('/api/files/upload', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				// console.log('File Uploaded', result);

				const { id, data, filename, type, mediaType } = result;

				return {
					url: getImageURL('documents', id, data, 'full'),
					filename: filename,
					mediaType,
					type
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
		event.preventDefault();

		const attachments = Array.from(event.currentTarget.files || []);
		uploadQueue = attachments.map((file) => file.name);

		try {
			const uploadPromises = attachments.map((file) => uploadFile(file));
			const uploadedAttachments = await Promise.all(uploadPromises);
			const successfullyUploadedAttachments = uploadedAttachments.filter(
				(attachment) => attachment !== undefined
			);

			files = [...files, ...successfullyUploadedAttachments];
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
	<!-- {#if mounted && chatClient.messages.length === 0 && files.length === 0 && uploadQueue.length === 0} -->
	{#if mounted}
		<SuggestedActions {user} {chatClient} {model} />
	{/if}

	<input
		type="file"
		class="pointer-events-none fixed -top-4 -left-4 size-0.5 opacity-0"
		bind:this={fileInputRef}
		multiple
		onchange={handleFileChange}
		tabIndex={-1}
		disabled={loading}
	/>

	{#if files.length > 0 || uploadQueue.length > 0}
		<div class="flex flex-row items-end gap-2 overflow-x-scroll">
			{#each files as file (file.url)}
				<PreviewAttachment {file} />
			{/each}

			{#each uploadQueue as filename (filename)}
				<PreviewAttachment
					file={{
						url: '',
						filename,
						mediaType: '',
						type: 'file'
					}}
					uploading
				/>
			{/each}
		</div>
	{/if}

	<Textarea
		bind:ref={textareaRef}
		placeholder="Send a message..."
		bind:value={() => input, setInput}
		class={cn(
			'max-h-[calc(75dvh)] min-h-[24px] resize-none overflow-hidden rounded-2xl bg-muted pb-10 !text-base dark:border-zinc-700',
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

	{#if model?.allowFiles}
		<div class="absolute bottom-0 flex w-fit flex-row justify-start p-2">
			{@render attachmentsButton()}
		</div>
	{/if}

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
			chatClient.stop();
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
