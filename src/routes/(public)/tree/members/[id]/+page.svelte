<script lang="ts">
	import { page } from '$app/state';
	import Hover3d from '$lib/components/hover3d.svelte';
	import IdCard from '$lib/components/id_card.svelte';
	import Tree from '$lib/components/tree.svelte';
	const familyData = $derived(page.data.families?.[0]);
	const member = $derived(familyData?.members?.find((v: any) => v._id === page.params.id));
	const family = $derived(familyData?.family);
</script>

<div class="my-10 flex items-center justify-center">
	<Hover3d>
		<IdCard {member} {family} />
	</Hover3d>
</div>

<Tree
	families={page.data.families}
	relationships={page.data.relationships}
	focus={page.params.id}
/>
