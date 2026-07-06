<script>
	import { page } from '$app/state';
	import Tree from '$lib/components/tree.svelte';
</script>

<div class="flex h-[85vh]">
	<Tree
		families={page.data.pageData.families}
		relationships={page.data.pageData.relationships}
		showTitle
	/>
</div>
