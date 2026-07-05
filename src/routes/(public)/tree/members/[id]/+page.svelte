<script lang="ts">
	import { page } from '$app/state';
	import Hover3d from '$lib/components/hover3d.svelte';
	import IdCard from '$lib/components/id_card.svelte';
	import Tree from '$lib/components/tree.svelte';
	import { langStore } from '$lib/store/lang';
	const familyData = $derived(page.data.families?.[0]);
	const member = $derived(familyData?.members?.find((v: any) => v._id === page.params.id));
	const family = $derived(familyData?.family);
</script>

{#if member && family}
	<div class="my-10 flex items-center justify-center">
		<Hover3d>
			<IdCard
				title={member.title}
				name={member.name}
				isCenter={family.center === member._id}
				familyName={family.fullName}
				avatarUrl={member.avatarUrl && `${page.data.config.s3BaseUrl}/${member.avatarUrl}`}
			/>
		</Hover3d>
	</div>
{/if}

<Tree
	families={page.data.families}
	relationships={page.data.relationships}
	focus={page.params.id}
/>
