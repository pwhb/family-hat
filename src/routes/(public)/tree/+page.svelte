<script>
	import { page } from '$app/state';
	import InterFamilyTreeGroup from '$lib/components/inter_family_tree_group.svelte';
	import IsolatedFamilyTreeGroup from '$lib/components/isolated_family_tree_group.svelte';
</script>

<div class="flex h-[85vh]">
	{#if page.data.pageConfig.view === 'InterFamilyTreeGroup'}
		<InterFamilyTreeGroup
			families={page.data.pageData.families}
			relationships={page.data.pageData.relationships}
			showTitle
		/>
	{:else}
		<IsolatedFamilyTreeGroup
			families={page.data.pageData.families}
			relationships={page.data.pageData.relationships}
			showTitle
		/>
	{/if}
</div>
