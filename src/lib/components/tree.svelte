<script lang="ts">
	import { page } from '$app/state';
	import { langStore } from '$lib/store/lang';
	import { onMount } from 'svelte';

	const getLevels = (list: any[]) =>
		Object.entries(
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

	const { families, relationships } = page.data;

	// --- DOM Elements & Path States ---
	let scrollContainerRef: HTMLElement | null = $state(null);
	let elRefs: Record<string, HTMLElement> = $state({});
	let svgPaths: any[] = $state([]);

	// Track full internal dimension boundary sizes
	let svgDimensions = $state({ width: 0, height: 0 });
	let ticking = false;

	function calculatePaths() {
		if (!scrollContainerRef || !relationships) return;

		// 1. Force the SVG container canvas size to match the true scroll size of the content
		svgDimensions = {
			width: scrollContainerRef.scrollWidth,
			height: scrollContainerRef.scrollHeight
		};

		// 2. Base our coordinate context on the scrollable container itself!
		// This stops lines from unbinding when you pan around.
		const containerRect = scrollContainerRef.getBoundingClientRect();

		// Account for current scroll offsets
		const scrollX = scrollContainerRef.scrollLeft;
		const scrollY = scrollContainerRef.scrollTop;

		svgPaths = relationships
			.map((rel: any) => {
				const fromEl = elRefs[rel.sourceID];
				const toEl = elRefs[rel.targetID];

				if (!fromEl || !toEl) return null;

				const fromRect = fromEl.getBoundingClientRect();
				const toRect = toEl.getBoundingClientRect();

				// Compute exact positions accounting for scroll offsets
				const x1 = fromRect.left + fromRect.width / 2 - containerRect.left + scrollX;
				const x2 = toRect.left + toRect.width / 2 - containerRect.left + scrollX;

				const y1 =
					(rel.sourceEnd === 'top' ? fromRect.top : fromRect.bottom) - containerRect.top + scrollY;
				const y2 = (rel.targetEnd === 'top' ? toRect.top : toRect.bottom) - containerRect.top + scrollY;

				const OVERLAP_OFFSET = 24;
				let pathData = '';

				if (rel.sourceEnd === 'top' && rel.targetEnd === 'top') {
					const risePoint = Math.min(y1, y2) - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${risePoint} H ${x2} V ${y2}`;
				} else if (rel.sourceEnd === 'bottom' && rel.targetEnd === 'bottom') {
					const dropPoint = Math.max(y1, y2) + OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${dropPoint} H ${x2} V ${y2}`;
				} else {
					const overlapY = y2 - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${overlapY} H ${x2} V ${y2}`;
				}

				return {
					pathData,
					label: rel.sourceLabel[$langStore]
				};
			})
			.filter(Boolean);

		ticking = false;
	}

	function requestPathUpdate() {
		if (!ticking) {
			requestAnimationFrame(calculatePaths);
			ticking = true;
		}
	}

	$effect(() => {
		const _lang = $langStore;
		requestPathUpdate();
	});

	onMount(() => {
		window.addEventListener('resize', requestPathUpdate);

		// Run a clean layout cycle once everything renders in
		setTimeout(calculatePaths, 60);

		return () => window.removeEventListener('resize', requestPathUpdate);
	});
</script>

<div
	bind:this={scrollContainerRef}
	class="relative h-screen w-screen overflow-auto bg-gray-50 p-8"
	onscroll={requestPathUpdate}
>
	<svg
		class="pointer-events-none absolute top-0 left-0 z-0"
		width={svgDimensions.width}
		height={svgDimensions.height}
	>
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

	<div class="relative z-10 mx-auto flex min-h-full w-max flex-row items-center gap-12">
		{#each families as item, idx}
			<div class="flex flex-col items-center justify-center px-4">
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
				<div class="divider mx-2 divider-horizontal"></div>
			{/if}
		{/each}
	</div>
</div>
