<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import type { PageData } from './$types';
	import PasswordResetForm from './PasswordResetForm.svelte';
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
				<h1 class="mt-4 mb-1 text-xl font-semibold">Reset Password</h1>
				<p class="text-sm">We'll send you an email to reset your password.</p>
			</div>

			<PasswordResetForm {data} />
		</div>

		<div class="p-3">
			<p class="text-center text-sm text-accent-foreground">
				Remembered your password?
				<Button href="/login" variant="link" class="px-2">Log in</Button>
			</p>
		</div>
	</div>
</section>
