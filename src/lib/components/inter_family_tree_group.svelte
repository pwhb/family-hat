<script lang="ts">
	import { onMount } from 'svelte';
	import { lang } from '$lib/store/lang.svelte';
	import InterFamilyTree from './inter_family_tree.svelte';
	import { page } from '$app/state';
	import { setActivePathContext } from '$lib/store/tree.svelte';
	import { mergeDefaults } from '$lib/client/common';

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
	let isHoveringCard = $state(false);
	let svgDimensions = $state({ width: 0, height: 0 });
	let ticking = false;
	let lastShuffleTime = 0;

	let activePath = $derived(hoveredPathIdx !== null ? svgPaths[hoveredPathIdx] : null);
	setActivePathContext(() => activePath);
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

				const OVERLAP_OFFSET = 32;
				let pathData = '';

				if (rel.sourceEnd === 'TOP' && rel.targetEnd === 'TOP') {
					const risePoint = Math.min(y1, y2) - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${risePoint} H ${x2} V ${y2}`;
				} else if (rel.sourceEnd === 'BOTTOM' && rel.targetEnd === 'BOTTOM') {
					const dropPoint = Math.max(y1, y2) + OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${dropPoint} H ${x2} V ${y2}`;
				} else if (rel.sourceEnd === 'SIDE' || rel.targetEnd === 'SIDE') {
					const isSourceLeft = x1 < x2;
					// 2. Attach to the right edge of left card, left edge of right card
					const startX = isSourceLeft
						? fromRect.right - containerRect.left + scrollX
						: fromRect.left - containerRect.left + scrollX;
					const endX = isSourceLeft
						? toRect.left - containerRect.left + scrollX
						: toRect.right - containerRect.left + scrollX;
					// 3. Stagger the vertical entry points (Left = Shift Up 16px, Right = Shift Down 16px)
					const OFFSET = 48;
					const startY = fromRect.top + fromRect.height / 2 - containerRect.top + scrollY - OFFSET;
					const endY = toRect.top + toRect.height / 2 - containerRect.top + scrollY + OFFSET;
					// 4. Calculate horizontal midpoint between the two cards
					const midX = startX + (endX - startX) / 2;
					// 5. Orthogonal path: Right -> Down/Up to Step -> Right
					pathData = `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
				} else {
					const overlapY = y2 - OVERLAP_OFFSET;
					pathData = `M ${x1} ${y1} V ${overlapY} H ${x2} V ${y2}`;
				}
				return {
					pathData,
					label: mergeDefaults(rel.name, rel.customName),
					sourceID: rel.sourceID,
					targetID: rel.targetID,
					sourceLabel: mergeDefaults(rel.sourceLabel, rel.customSourceLabel),
					targetLabel: mergeDefaults(rel.targetLabel, rel.customTargetLabel),
					category: rel.category,
					color: page.data.config.colorMap[rel.category]
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
		const _lang = lang.value;
		const _families = families;
		const _relationships = relationships;
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
	{#if activePath}
		<div
			class={page.data.config.centerInfoBox
				? 'pointer-events-none fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-base-300 bg-base-100/90 p-4 break-all shadow-xl backdrop-blur-md transition-all duration-200'
				: 'pointer-events-none fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-base-300 bg-base-100/90 p-4 break-all shadow-xl backdrop-blur-md transition-all duration-200'}
			style="border-left: 6px solid {activePath.color}"
		>
			<div>
				<p class="text-xs font-semibold tracking-wider text-base-content/60 uppercase">
					{page.data.config.titleMap[activePath.category][lang.value]}
				</p>
				<p class="text-sm font-bold text-base-content">
					{activePath.label[lang.value]}
				</p>
			</div>
		</div>
	{/if}

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
				stroke={hoveredPathIdx === idx ? path.color : '#94a3b8'}
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

	<div class="relative z-10 mx-auto flex min-h-max w-max flex-row items-stretch gap-4">
		{#each families as item, idx}
			<InterFamilyTree
				{item}
				{focus}
				{showTitle}
				{elRefs}
				onCardHover={(isHovering) => {
					isHoveringCard = isHovering;
					if (isHovering) hoveredPathIdx = null;
				}}
			/>
			{#if families.length !== idx + 1}
				<div class="divider mx-4 divider-horizontal self-stretch opacity-60"></div>
			{/if}
		{/each}
	</div>
</div>
