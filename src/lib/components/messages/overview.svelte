<script lang="ts">
	import TreePalmIcon from '@lucide/svelte/icons/tree-palm';
	import MessageIcon from '@lucide/svelte/icons/message-circle';
	import { scale } from 'svelte/transition';
</script>

<div class="mx-auto max-w-3xl md:mt-20" transition:scale={{ opacity: 0, start: 0.98 }}>
	<div class="flex max-w-xl flex-col gap-8 rounded-xl p-6 text-center leading-relaxed">
		<p class="flex flex-row items-center justify-center gap-4">
			<TreePalmIcon size={32} />
			<span>+</span>
			<MessageIcon size={32} />
		</p>
		<p>
			This is an
			<a
				class="font-medium underline underline-offset-4"
				href="https://github.com/vercel/ai-chatbot-svelte"
				target="_blank"
			>
				open source
			</a>
			chatbot template built with SvelteKit and the AI SDK by Vercel. It uses the
			<code class="bg-muted rounded-md px-1 py-0.5">streamText</code>
			function in the server and the
			<code class="bg-muted rounded-md px-1 py-0.5">useChat</code> hook on the client to create a seamless
			chat experience.
		</p>
		<p>
			You can learn more about the AI SDK by visiting the
			<a
				class="font-medium underline underline-offset-4"
				href="https://sdk.vercel.ai/docs"
				target="_blank"
			>
				docs
			</a>
			.
		</p>
	</div>
</div>
