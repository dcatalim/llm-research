<script lang="ts">
	import { page } from '$app/state';
	import * as Empty from '$lib/components/ui/empty/index.js';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Title>{page.status} - {page.error?.message}</Empty.Title>
		<Empty.Description>The page you're looking for doesn't exist.</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<Empty.Description>
			Need help? <a href="#/">Contact support</a>
		</Empty.Description>
	</Empty.Content>
</Empty.Root>
