<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/store/lang.svelte';
	import IsolatedFamilyTree from './isolated_family_tree.svelte';

	interface Props {
		families: any[];
		relationships: any[];
		focus?: string;
		showTitle?: boolean;
	}

	let { families, relationships, focus, showTitle }: Props = $props();
	let scrollContainerRef: HTMLElement | null = $state(null);

	// Global tracking reference map sharded downstream to children
	let elRefs: Record<string, HTMLElement> = $state({});
	let svgPaths: any[] = $state([]);
	let hoveredPathIdx: number | null = $state(null);
	let isHoveringCard = $state(false);
	let svgDimensions = $state({ width: 0, height: 0 });
	let ticking = false;
	let lastShuffleTime = 0;

	// 1. Reactive map to track exactly which member belongs to which family block
	const memberFamilyMap = $derived.by(() => {
		const map = new Map<string, string>();
		for (const f of families) {
			const familyId = f.family._id;
			for (const member of f.members) {
				map.set(member._id, familyId);
			}
		}
		return map;
	});

	// 2. Client-side state filter ensures we only render intra-family lines globally
	const localRelationships = $derived.by(() => {
		return relationships.filter((rel) => {
			const sourceFamilyId = memberFamilyMap.get(rel.sourceID);
			const targetFamilyId = memberFamilyMap.get(rel.targetID);
			return sourceFamilyId && sourceFamilyId === targetFamilyId;
		});
	});

	// 3. Exactly identical, robust path calculation method reused from Inter version
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

				// Instead of a single static number, separate them into distinct structural lanes
				const OFFSET_BOTTOM_TO_BOTTOM = 36; // Drops lower down
				const OFFSET_TOP_TO_TOP = 20; // Hugs tighter to the top
				const OVERLAP_OFFSET = 28; // Default for mixed connections

				let pathData = '';

				if (rel.sourceEnd === 'TOP' && rel.targetEnd === 'TOP') {
					const risePoint = Math.min(y1, y2) - OFFSET_TOP_TO_TOP;
					pathData = `M ${x1} ${y1} V ${risePoint} H ${x2} V ${y2}`;
				} else if (rel.sourceEnd === 'BOTTOM' && rel.targetEnd === 'BOTTOM') {
					const dropPoint = Math.max(y1, y2) + OFFSET_BOTTOM_TO_BOTTOM;
					pathData = `M ${x1} ${y1} V ${dropPoint} H ${x2} V ${y2}`;
				} else {
					const overlapY = y2 - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${overlapY} H ${x2} V ${y2}`;
				}

				return { pathData, label: rel.sourceLabel[lang.value] };
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

	// 4. Identical intersection lookup system that catches overlaps correctly
	function handlePathIntersection(clientX: number, clientY: number) {
		const elements = document.elementsFromPoint(clientX, clientY);
		const hitboxes = elements.filter((el) => el.classList.contains('hitbox-track'));

		if (hitboxes.length > 0) {
			const indices = hitboxes.map((el) => parseInt(el.getAttribute('data-index') || '0', 10));
			if (hitboxes.length === 1) {
				hoveredPathIdx = indices[0];
				return;
			}

			const now = Date.now();
			if (now - lastShuffleTime > 400) {
				const otherIndices = indices.filter((idx) => idx !== hoveredPathIdx);
				const choices = otherIndices.length > 0 ? otherIndices : indices;
				hoveredPathIdx = choices[Math.floor(Math.random() * choices.length)];
				lastShuffleTime = now;
			}
		} else {
			hoveredPathIdx = null;
		}
	}

	$effect(() => {
		const _deps = [lang.value, families, relationships, localRelationships];
		requestPathUpdate();
	});

	onMount(() => {
		window.addEventListener('resize', requestPathUpdate);
		setTimeout(calculatePaths, 60);
		return () => window.removeEventListener('resize', requestPathUpdate);
	});
</script>

<div
	bind:this={scrollContainerRef}
	class="relative h-screen w-screen overflow-auto p-12"
	onscroll={requestPathUpdate}
>
	<!-- Global Shared SVG Vector Rendering Plane Layer -->
	<svg
		class="pointer-events-none absolute top-0 left-0 transition-all duration-75 {isHoveringCard
			? 'z-0 opacity-60'
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
				stroke-width="24"
				stroke-linejoin="round"
				data-index={idx}
				role="presentation"
				aria-hidden="true"
				class="hitbox-track cursor-pointer"
				style="pointer-events: stroke; touch-action: none;"
				onpointerdown={(e) => handlePathIntersection(e.clientX, e.clientY)}
				onpointermove={(e) => handlePathIntersection(e.clientX, e.clientY)}
				onpointerleave={() => {
					hoveredPathIdx = null;
				}}
			/>
		{/each}
	</svg>

	<!-- Side-by-side Isolated Family Blocks Box Layout -->
	<div class="relative z-10 mx-auto flex min-h-max w-max flex-row items-stretch gap-12">
		{#each families as item, idx}
			<div class="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
				<IsolatedFamilyTree
					{item}
					{focus}
					{showTitle}
					{elRefs}
					onCardHover={(isHovering) => {
						isHoveringCard = isHovering;
						if (isHovering) hoveredPathIdx = null;
					}}
				/>
			</div>
			{#if families.length !== idx + 1}
				<div class="divider divider-horizontal self-stretch opacity-30"></div>
			{/if}
		{/each}
	</div>
</div>
