<script lang="ts">
	import { page } from '$app/state';
	import IdCard from '$lib/components/id_card.svelte';
	import Tree from '$lib/components/tree.svelte';
	import { langStore } from '$lib/store/lang';

	const familyData = $derived(page.data.families?.[0]);

	// 2. Compute the member directly using optional chaining (?.) to prevent crashes
	const member = $derived(familyData?.members?.find((v: any) => v._id === page.params.id));

	// 3. Compute the family object directly
	const family = $derived(familyData?.family);
</script>

{#if member && family}
	<div class="my-10 flex items-center justify-center">
		<IdCard
			title={member.title?.[$langStore] || ''}
			name={member.name?.[$langStore] || ''}
			isCenter={family.center === member._id}
			familyName={family.fullName?.[$langStore] || ''}
		/>
	</div>
{/if}

<Tree
	families={page.data.families}
	relationships={page.data.relationships}
	focus={page.params.id}
/>
