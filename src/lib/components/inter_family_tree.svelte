<script lang="ts">
	import Hover3d from './hover3d.svelte';
	import IdCard from './id_card.svelte';
	import { lang } from '$lib/store/lang.svelte';

	interface TreeGroupProps {
		item: any;
		focus?: string;
		showTitle?: boolean;
		elRefs: Record<string, HTMLElement>; // Shard mutable reference container
		onCardHover: (isHovering: boolean) => void;
	}

	let { item, focus, showTitle, elRefs, onCardHover }: TreeGroupProps = $props();

	const getLevels = (list: any[]) => {
		return Object.entries(
			list.reduce((acc: any, person: any) => {
				acc[person.level] = acc[person.level] || [];
				acc[person.level].push(person);
				return acc;
			}, {})
		)
			.sort((a: any, b: any) => b[0] - a[0])
			.map(([level, members]: any) => [
				level,
				members.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
			]);
	};
</script>

<div class="flex w-max flex-col items-center justify-center px-10">
	{#if showTitle}
		<h1 class="mb-24 text-2xl font-bold text-gray-800">
			{item.family.fullName[lang.value]}
		</h1>
	{/if}
	<div class="flex w-max flex-col items-center gap-24">
		{#each getLevels(item.members) as [level, members]}
			<div class="flex w-full flex-col items-center">
				<div class="flex w-max items-start justify-center gap-8 px-4">
					{#each members as member}
						<!-- Mutation assignment updates parent's object record instantly -->
						<a
							bind:this={elRefs[member._id]}
							href={`/tree/members/${member._id}`}
							class="relative block"
							onpointerenter={() => onCardHover(true)}
							onpointerleave={() => onCardHover(false)}
						>
							<Hover3d>
								<IdCard {member} family={item.family} {focus} />
							</Hover3d>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
