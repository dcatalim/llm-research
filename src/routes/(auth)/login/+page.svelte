<script lang="ts">
	import type { PageData } from './$types.js';
	import LoginForm from './LoginForm.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Logo from '$lib/components/Logo.svelte';

	let { data }: { data: PageData } = $props();
</script>

<section class="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
	<div class="m-auto h-fit w-full max-w-sm">
		<div class="p-6">
			<div>
				<a href="/" aria-label="go home">
					<Logo />
				</a>
				<h1 class="mt-4 mb-1 text-xl font-semibold">Welcome back!</h1>
				<p>Sign in to access the platform.</p>
			</div>

			<LoginForm {data} />
		</div>

		<div class="p-3">
			<p class="text-center text-sm text-accent-foreground">
				Don't have an account?
				<Button href="/register" variant="link" class="px-2">Create Account</Button>
			</p>
		</div>
	</div>
</section>
