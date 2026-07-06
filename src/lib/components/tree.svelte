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

				const OVERLAP_OFFSET = 32;
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

	let lastShuffleTime = 0;

	// MODIFIED: Accepts PointerEvents to handle mouse drags, finger movements, and taps identically
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
				const randomIndex = choices[Math.floor(Math.random() * choices.length)];

				hoveredPathIdx = randomIndex;
				lastShuffleTime = now;
			}
		} else {
			// Clear if tracking pointer left the line bounds entirely
			hoveredPathIdx = null;
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

<div
	bind:this={scrollContainerRef}
	class="relative h-screen w-screen overflow-auto p-12"
	onscroll={requestPathUpdate}
>
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
				onpointerdown={(e) => {
					handlePathIntersection(e.clientX, e.clientY);
				}}
				onpointermove={(e) => {
					handlePathIntersection(e.clientX, e.clientY);
				}}
				onpointerleave={() => {
					hoveredPathIdx = null;
				}}
			/>
		{/each}
	</svg>

	<div class="relative z-10 mx-auto flex min-h-max w-max flex-row items-stretch gap-4">
		{#each families as item, idx}
			<div class="flex w-max flex-col items-center justify-center px-10">
				{#if showTitle}
					<h1 class="mb-24 text-2xl font-bold text-gray-800">
						{item.family.fullName[$langStore]}
					</h1>
				{/if}
				<div class="flex w-max flex-col items-center gap-24">
					{#each getLevels(item.members) as [level, members]}
						<div class="flex w-full flex-col items-center">
							<div class="flex w-max items-start justify-center gap-8 px-4">
								{#each members as member}
									<a
										bind:this={elRefs[member._id]}
										href={`/tree/members/${member._id}`}
										class="relative block"
										onpointerenter={() => {
											isHoveringCard = true;
											hoveredPathIdx = null;
										}}
										onpointerleave={() => {
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
				<div class="divider mx-4 divider-horizontal self-stretch opacity-60"></div>
			{/if}
		{/each}
	</div>
</div>
