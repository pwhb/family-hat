<script lang="ts">
	import Hover3d from './hover3d.svelte';
	import IdCard from './id_card.svelte';
	import { lang } from '$lib/store/lang.svelte';
	import { page } from '$app/state';
	import HistoricalCard from './historical_card.svelte';

	interface Props {
		item: any;
		focus?: string;
		showTitle?: boolean;
		elRefs: Record<string, HTMLElement>; // Mutable parent dictionary bridge
		onCardHover: (isHovering: boolean) => void;
	}

	let { item, focus, showTitle, elRefs, onCardHover }: Props = $props();

	const getLevels = (list: any[]) => {
		return Object.entries(
			list.reduce((acc: any, person: any) => {
				acc[person.level] = acc[person.level] || [];
				acc[person.level].push(person);
				return acc;
			}, {})
		)
			.sort((a: any, b: any) => b[0] - a[0])
			.map(([lvl, mbrs]: any) => [
				lvl,
				mbrs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
			]);
	};
</script>

<div class="flex w-max flex-col items-center justify-center px-10">
	{#if showTitle}
		<h1 class="mb-12 text-xl font-bold text-gray-800">
			{item.family.fullName[lang.value]}
		</h1>
	{/if}
	<div class="flex w-max flex-col items-center gap-16">
		{#each getLevels(item.members) as [level, members]}
			<div class="flex w-max items-start justify-center gap-6">
				{#each members as member}
					<!-- Mutation updates parent's global location lookup dictionary instantaneously -->

					{#if page.data.pageConfig.cardView}
						{#if page.data.pageConfig.cardView === 'HistoricalCard'}
							<HistoricalCard {member} family={item.family} {focus} />
						{/if}
					{:else}
						<a
							bind:this={elRefs[member._id]}
							href={`/tree/members/${member._id}`}
							class="block"
							onpointerenter={() => onCardHover(true)}
							onpointerleave={() => onCardHover(false)}
						>
							<Hover3d>
								<IdCard {member} family={item.family} {focus} />
							</Hover3d>
						</a>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>
