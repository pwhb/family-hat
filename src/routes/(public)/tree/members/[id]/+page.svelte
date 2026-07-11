<script lang="ts">
	import { page } from '$app/state';
	import Hover3d from '$lib/components/hover3d.svelte';
	import IdCard from '$lib/components/id_card.svelte';
	import InterFamilyTreeGroup from '$lib/components/inter_family_tree_group.svelte';
	import IsolatedFamilyTreeGroup from '$lib/components/isolated_family_tree_group.svelte';

</script>

<div class="my-10 flex items-center justify-center">
	<Hover3d>
		<IdCard
			member={page.data.pageData.member}
			family={page.data.pageData.families[0].family}
			type="full"
		/>
	</Hover3d>
</div>

{#if page.data.pageConfig.view === 'InterFamilyTreeGroup'}
	<InterFamilyTreeGroup
		families={page.data.pageData.families}
		relationships={page.data.pageData.relationships}
		focus={page.params.id}
	/>
{:else}
	<IsolatedFamilyTreeGroup
		families={page.data.pageData.families}
		relationships={page.data.pageData.relationships}
		focus={page.params.id}
	/>
{/if}
