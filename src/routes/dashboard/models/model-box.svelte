<script lang="ts">
 import * as Item from "$lib/components/ui/item/index.js";
 import { Button } from "$lib/components/ui/button/index.js";
 import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
 import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

 let {model} = $props()
</script>
 
 <Item.Root variant="outline">
  <Item.Content>
   <Item.Title>{model.name}</Item.Title>
   <Item.Description
    >{model.provider}:{model.version}</Item.Description
   >
  </Item.Content>
  <Item.Actions>
   <Button href={`/dashboard/models/${model.id}/edit`} variant="outline" size="sm">Edit</Button>
  </Item.Actions>
 </Item.Root>
 
