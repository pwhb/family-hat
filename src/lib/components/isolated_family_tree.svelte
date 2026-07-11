<script lang="ts">
    import { onMount } from 'svelte';
    import Hover3d from './hover3d.svelte';
    import IdCard from './id_card.svelte';
    import { lang } from '$lib/store/lang.svelte';

    interface Props {
        item: any;
        relationships: any[];
        focus?: string;
        showTitle?: boolean;
    }

    let { item, relationships, focus, showTitle }: Props = $props();
    let localTreeRef: HTMLElement | null = $state(null);
    let elRefs: Record<string, HTMLElement> = $state({});
    let svgPaths: any[] = $state([]);
    let hoveredPathIdx: number | null = $state(null);
    let svgDimensions = $state({ width: 0, height: 0 });

    const getLevels = (list: any[]) => {
        return Object.entries(list.reduce((acc: any, person: any) => {
            acc[person.level] = acc[person.level] || [];
            acc[person.level].push(person);
            return acc;
        }, {})).sort((a: any, b: any) => b[0] - a[0]).map(([lvl, mbrs]: any) => [lvl, mbrs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))]);
    };

function calculateLocalPaths() {
        if (!localTreeRef || !relationships.length) return;
        
        svgDimensions = { width: localTreeRef.scrollWidth, height: localTreeRef.scrollHeight };
        const containerRect = localTreeRef.getBoundingClientRect();

        svgPaths = relationships.map((rel: any) => {
            const fromEl = elRefs[rel.sourceID];
            const toEl = elRefs[rel.targetID];
            if (!fromEl || !toEl) return null;

            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();

            const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
            const x2 = toRect.left + toRect.width / 2 - containerRect.left;
            const y1 = (rel.sourceEnd === 'TOP' ? fromRect.top : fromRect.bottom) - containerRect.top;
            const y2 = (rel.targetEnd === 'TOP' ? toRect.top : toRect.bottom) - containerRect.top;

            // Give different types of lines dedicated visual lanes so they never share a track
            let OVERLAP_OFFSET = 24; 
            if (rel.sourceEnd === 'BOTTOM' && rel.targetEnd === 'BOTTOM') {
                OVERLAP_OFFSET = 36; // Pushes bottom loops lower into their own lane
            } else if (rel.sourceEnd === 'TOP' && rel.targetEnd === 'TOP') {
                OVERLAP_OFFSET = 20; // Keeps top loops tighter to the cards
            }

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

            return { pathData };
        }).filter(Boolean);
    }
    $effect(() => {
        const _deps = [relationships, item];
        calculateLocalPaths();
    });

    onMount(() => {
        setTimeout(calculateLocalPaths, 60);
    });
</script>

<div bind:this={localTreeRef} class="relative flex w-max flex-col items-center justify-center p-4">
    {#if relationships.length > 0}
        <!-- Set container styling to pointer-events: none, but paths manually handle interaction -->
        <svg 
            style="pointer-events: none;" 
            class="absolute top-0 left-0 z-20" 
            width={svgDimensions.width} 
            height={svgDimensions.height}
        >
            {#each svgPaths as path, idx}
                <!-- 1. Styled Path Core -->
                <path 
                    d={path.pathData} 
                    fill="none" 
                    stroke={hoveredPathIdx === idx ? '#28a745' : '#64748b'} 
                    stroke-width={hoveredPathIdx === idx ? '4' : '2'} 
                    stroke-linejoin="round" 
                    class="transition-all duration-150 {hoveredPathIdx !== null && hoveredPathIdx !== idx ? 'opacity-40' : 'opacity-100'}"
                />
                
                <!-- 2. Invisible Wide Interactive Track Bridge -->
                <path 
                    d={path.pathData} 
                    fill="none" 
                    stroke="transparent" 
                    stroke-width="20" 
                    stroke-linejoin="round"
                    style="pointer-events: stroke; cursor: pointer;" 
                    onmouseenter={() => hoveredPathIdx = idx}
                    onmouseleave={() => hoveredPathIdx = null}
                />
            {/each}
        </svg>
    {/if}

    <div class="relative z-10 flex w-max flex-col items-center">
        {#if showTitle}
            <h1 class="mb-12 text-xl font-bold text-gray-800">{item.family.fullName[lang.value]}</h1>
        {/if}
    <div class="flex w-max flex-col items-center gap-24">
            {#each getLevels(item.members) as [level, members]}
                <div class="flex w-max items-start justify-center gap-6">
                    {#each members as member}
                        <a bind:this={elRefs[member._id]} href={`/tree/members/${member._id}`} class="block">
                            <Hover3d><IdCard {member} family={item.family} {focus} /></Hover3d>
                        </a>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>