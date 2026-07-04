<script>
	import { page } from '$app/state';
	import Tree from '$lib/components/tree.svelte';
</script>

<div class="flex h-[85vh]">
	<Tree families={page.data.families} relationships={page.data.relationships} showTitle />
</div>
