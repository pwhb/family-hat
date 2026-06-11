<script lang="ts">
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';
	import { onMount } from 'svelte';

	const getLevels: any = (list: any[]) =>
		Object.entries(
			list.reduce((acc: any, person: any) => {
				acc[person.level] = acc[person.level] || [];
				acc[person.level].push(person);
				return acc;
			}, {})
		)
			// 1. Sort the rows vertically (Generations: Level 1 above Level 0)
			.sort((a: any, b: any) => b[0] - a[0])
			// 2. Sort the entries inside each row horizontally by their 'order' property
			.map(([level, members]: any) => [
				level,
				members.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
			]);

	const { families, relationships } = page.data;

	// --- DOM Elements & Path States ---
	let containerRef: HTMLElement | null = $state(null);
	let elRefs: Record<string, HTMLElement> = $state({});
	let svgPaths: any[] = $state([]);

	function calculatePaths() {
		console.log('calculatePaths');

		if (!containerRef || !relationships) return;
		const containerRect = containerRef.getBoundingClientRect();

		svgPaths = relationships
			.map((rel: any) => {
				const fromEl = elRefs[rel.fromID];
				const toEl = elRefs[rel.toID];

				if (!fromEl || !toEl) return null;

				const fromRect = fromEl.getBoundingClientRect();
				const toRect = toEl.getBoundingClientRect();

				// Calculate precise middle horizontal centers relative to the master wrapper
				const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
				const x2 = toRect.left + toRect.width / 2 - containerRect.left;

				// Pick the vertical anchor depending on the schema specifications
				const y1 = (rel.fromEnd === 'top' ? fromRect.top : fromRect.bottom) - containerRect.top;
				const y2 = (rel.toEnd === 'top' ? toRect.top : toRect.bottom) - containerRect.top;

				// The uniform offset above the top of the current row
				const OVERLAP_OFFSET = 24;

				let pathData = '';

				if (rel.fromEnd === 'top' && rel.toEnd === 'top') {
					// Sibling Line: Arches up above the top of the cards
					const risePoint = Math.min(y1, y2) - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${risePoint} H ${x2} V ${y2}`;
				} else if (rel.fromEnd === 'bottom' && rel.toEnd === 'bottom') {
					// Spouse Line: Drops below the bottom of the cards
					const dropPoint = Math.max(y1, y2) + OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${dropPoint} H ${x2} V ${y2}`;
				} else {
					// Generational Line (e.g., Uncle at Level 1 to Niece at Level 0)
					// To overlap perfectly with the sibling lines on Level 0,
					// the horizontal track must use the Target card's top coordinate (y2) minus the offset.
					const overlapY = y2 - OVERLAP_OFFSET;

					pathData = `M ${x1} ${y1} V ${overlapY} H ${x2} V ${y2}`;
				}

				return {
					pathData,
					label: rel.fromLabel[$langStore]
				};
			})
			.filter(Boolean);
	}

	// Reactively watch for DOM mutations or state changes to refresh layout tracking
	$effect(() => {
		// We explicitly look at langStore to re-trigger calculations if font sizes shift layout
		const _lang = $langStore;
		calculatePaths();
	});

	onMount(() => {
		console.log('onMount');

		window.addEventListener('resize', calculatePaths);
		window.addEventListener('scroll', () => {
			console.log('scroll');
		});
		return () => window.removeEventListener('resize', calculatePaths);
	});
</script>

<div bind:this={containerRef} class="relative min-h-screen w-full bg-gray-50">
	<svg class="pointer-events-none absolute inset-0 z-0 h-full w-full">
		{#each svgPaths as path}
			<path
				d={path.pathData}
				fill="none"
				stroke="#94a3b8"
				stroke-width="2.5"
				stroke-linejoin="round"
			/>
		{/each}
	</svg>

	<div
		class="relative z-10 flex min-h-[90vh] flex-row items-center justify-center overflow-auto p-8"
        onscroll={calculatePaths}
	>
		{#each families as item, idx}
			<div class="flex flex-col items-center justify-center">
				<h1 class="mb-12 text-2xl font-bold text-gray-800">
					{item.family.fullName[$langStore]}
				</h1>
				<div class="flex w-full max-w-4xl flex-col items-center gap-24">
					{#each getLevels(item.members) as [level, members]}
						<div class="flex w-full flex-col items-center">
							<div class="flex w-full items-start justify-center gap-8">
								{#each members as person}
									<div
										bind:this={elRefs[person._id]}
										class={`group relative min-h-24 w-48 min-w-37.5 rounded-xl border border-gray-200 p-4 text-center shadow-md ${item.family.bgColor}`}
									>
										<p class="font-bold text-gray-800">
											{person.name[$langStore]}
											<!-- {JSON.stringify({
                                                person, 
                                            })} -->
										</p>
										{#if person.title[$langStore]}
											<br />
											<p class="text-gray-800">({person.title[$langStore]})</p>
										{/if}
										{#if person._id === item.family.center}
											<span class="absolute -top-4 right-0 text-2xl">👑</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
			{#if families.length !== idx + 1}
				<div class="divider divider-horizontal"></div>
			{/if}
		{/each}
	</div>
</div>
