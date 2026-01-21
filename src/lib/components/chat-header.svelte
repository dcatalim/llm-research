<script lang="ts">
    import InfoIcon from "@lucide/svelte/icons/info"
	let {
		model
	}: {
		model: any;
	} = $props();

</script>

{#if model?.instructions}
	<div class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto max-w-3xl px-4 py-3">
            <div class="flex gap-2 align-middle items-center">
                <InfoIcon size={16}/>

                <p class="text-sm text-muted-background">
                    {model.instructions}
                </p>
            </div>
		</div>
	</div>
{/if}
