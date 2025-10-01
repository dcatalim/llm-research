<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import RegisterForm from './RegisterForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
	<div
		class=" m-auto h-fit w-full max-w-sm overflow-hidden dark:[--color-muted:var(--color-zinc-900)]"
	>
		<div class=" -m-px p-8 pb-6">
			<div>
				<a href="/" aria-label="go home">
					<Logo />
				</a>
				<h1 class="text-title mt-4 mb-1 text-xl font-semibold">Create an Account</h1>
				<p class="text-sm">Welcome! Create an account to start using the platform.</p>
			</div>

			<RegisterForm {data} />
		</div>

		<div class="p-3">
			<p class="text-center text-sm text-accent-foreground">
				Already have an account?
				<Button href="/login" variant="link" class="px-2">Sign In</Button>
			</p>
		</div>
	</div>
</section>
