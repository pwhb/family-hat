<script lang="ts">
	import { langStore } from '$lib/store/lang';
	import { onMount } from 'svelte';
	import Hover3d from './hover3d.svelte';
	import IdCard from './id_card.svelte';

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
	interface TreeProps {
		families: any[];
		relationships: any[];
		focus?: string;
		showTitle?: boolean;
	}

	let { families, relationships, focus, showTitle }: TreeProps = $props();
	let scrollContainerRef: HTMLElement | null = $state(null);
	let elRefs: Record<string, HTMLElement> = $state({});
	let svgPaths: any[] = $state([]);

	let hoveredPathIdx: number | null = $state(null);

	let svgDimensions = $state({ width: 0, height: 0 });
	let ticking = false;

	function calculatePaths() {
		if (!scrollContainerRef || !relationships) return;

		svgDimensions = {
			width: scrollContainerRef.scrollWidth,
			height: scrollContainerRef.scrollHeight
		};

		const containerRect = scrollContainerRef.getBoundingClientRect();
		const scrollX = scrollContainerRef.scrollLeft;
		const scrollY = scrollContainerRef.scrollTop;

		svgPaths = relationships
			.map((rel: any) => {
				const fromEl = elRefs[rel.sourceID];
				const toEl = elRefs[rel.targetID];

				if (!fromEl || !toEl) return null;

				const fromRect = fromEl.getBoundingClientRect();
				const toRect = toEl.getBoundingClientRect();

				const x1 = fromRect.left + fromRect.width / 2 - containerRect.left + scrollX;
				const x2 = toRect.left + toRect.width / 2 - containerRect.left + scrollX;

				const y1 =
					(rel.sourceEnd === 'TOP' ? fromRect.top : fromRect.bottom) - containerRect.top + scrollY;
				const y2 =
					(rel.targetEnd === 'TOP' ? toRect.top : toRect.bottom) - containerRect.top + scrollY;

				const OVERLAP_OFFSET = 48;
				let pathData = '';

				if (rel.sourceEnd === 'TOP' && rel.targetEnd === 'TOP') {
					const risePoint = Math.min(y1, y2) - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${risePoint} H ${x2} V ${y2}`;
				} else if (rel.sourceEnd === 'BOTTOM' && rel.targetEnd === 'BOTTOM') {
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

	// NEW FUNCTION: Triggers on mousemove over a hitbox to check for stacks natively and randomly select one
	let lastShuffleTime = 0;

	function handlePathIntersection(e: MouseEvent) {
		const elements = document.elementsFromPoint(e.clientX, e.clientY);
		const hitboxes = elements.filter((el) => el.classList.contains('hitbox-track'));

		if (hitboxes.length > 1) {
			const now = Date.now();

			// THE FIX: Only allow a new random path selection if 400ms has passed
			// since the last time we flipped the highlighted line.
			if (now - lastShuffleTime > 400) {
				const indices = hitboxes.map((el) => parseInt(el.getAttribute('data-index') || '0', 10));

				// Get all available overlapping lines *except* the one currently lit up
				// (This guarantees the line actually changes instead of picking itself again)
				const otherIndices = indices.filter((idx) => idx !== hoveredPathIdx);
				const choices = otherIndices.length > 0 ? otherIndices : indices;

				const randomIndex = choices[Math.floor(Math.random() * choices.length)];

				hoveredPathIdx = randomIndex;
				lastShuffleTime = now; // Lock the timer
			}
		}
	}

	$effect(() => {
		const _lang = $langStore;
		const _families = families;
		const _relationships = relationships;
		requestPathUpdate();
	});

	onMount(() => {
		window.addEventListener('resize', requestPathUpdate);
		setTimeout(calculatePaths, 60);
		return () => window.removeEventListener('resize', requestPathUpdate);
	});

	let isHoveringCard = $state(false);
</script>

<div bind:this={scrollContainerRef} class="relative overflow-auto p-8" onscroll={requestPathUpdate}>
	<svg
		class="pointer-events-none absolute top-0 left-0 transition-all duration-75 {isHoveringCard
			? 'z-0'
			: 'z-20'}"
		width={svgDimensions.width}
		height={svgDimensions.height}
	>
		{#each svgPaths as path, idx}
			<path
				d={path.pathData}
				fill="none"
				stroke={hoveredPathIdx === idx ? '#28a745' : '#94a3b8'}
				stroke-width={hoveredPathIdx === idx ? '5' : '2'}
				stroke-linejoin="round"
				class="transition-all duration-150 {hoveredPathIdx && hoveredPathIdx !== idx
					? 'opacity-40'
					: ''}"
			/>

			<path
				d={path.pathData}
				fill="none"
				stroke="transparent"
				stroke-width="10"
				stroke-linejoin="round"
				data-index={idx}
				role="presentation"
				aria-hidden="true"
				class="hitbox-track cursor-pointer"
				style="pointer-events: stroke;"
				onmouseenter={() => {
					if (hoveredPathIdx === null) hoveredPathIdx = idx;
				}}
				onmousemove={handlePathIntersection}
				onmouseleave={() => {
					hoveredPathIdx = null;
				}}
			/>
		{/each}
	</svg>

	<div class="relative z-10 mx-auto flex min-h-full w-max flex-row items-center gap-4">
		{#each families as item, idx}
			<div class="flex flex-col items-center justify-center p-10">
				{#if showTitle}
					<h1 class="mb-24 text-2xl font-bold text-gray-800">
						{item.family.fullName[$langStore]}
					</h1>
				{/if}
				<div class="flex w-full max-w-4xl flex-col items-center gap-24">
					{#each getLevels(item.members) as [level, members]}
						<div class="flex w-full flex-col items-center">
							<div class="flex w-full items-start justify-center gap-8">
								{#each members as member}
									<a
										bind:this={elRefs[member._id]}
										href={`/tree/members/${member._id}`}
										class="relative block"
										onmouseenter={() => {
											isHoveringCard = true;
											hoveredPathIdx = null; // Clear line focus immediately
										}}
										onmouseleave={() => {
											isHoveringCard = false;
										}}
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
			{#if families.length !== idx + 1}
				<div class="divider mx-2 divider-horizontal"></div>
			{/if}
		{/each}
	</div>
</div>
