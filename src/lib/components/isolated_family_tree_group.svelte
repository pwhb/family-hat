<script lang="ts">
    import IsolatedFamilyTree from './isolated_family_tree.svelte';

    interface Props {
        families: any[];
        relationships: any[];
        focus?: string;
        showTitle?: boolean;
    }

    let { families, relationships, focus, showTitle }: Props = $props();

    // 1. Map each individual member ID to their respective family ID
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
    // 2. Efficiently group intra-family relationships, and preserve cross-family capabilities
    const localRelationshipsMap = $derived.by(() => {
        const grouped: Record<string, any[]> = {};
        
        // Initialize arrays for each family
        for (const f of families) {
            grouped[f.family._id] = [];
        }

        for (const rel of relationships) {
            const sourceFamilyId = memberFamilyMap.get(rel.sourceID);
            const targetFamilyId = memberFamilyMap.get(rel.targetID);

            // If both ends belong to the exact same family, push to that family's local map
            if (sourceFamilyId && sourceFamilyId === targetFamilyId) {
                grouped[sourceFamilyId].push(rel);
            } else {
                // Future-proofing: This is where you can handle cross-family lines!
                // e.g., pushing to a global array or attaching to both families if needed.
            }
        }

        return grouped;
    });
</script>

<div class="h-screen w-screen overflow-auto p-12 bg-base-50">
    <div class="mx-auto flex min-h-max w-max flex-row items-start gap-12">
        {#each families as item, idx}
            <div class="rounded-3xl border border-base-200 bg-base-100 p-6 shadow-sm">
                <IsolatedFamilyTree 
                    {item} 
                    {focus} 
                    {showTitle} 
                    relationships={localRelationshipsMap[item.family._id] || []} 
                />
            </div>
            {#if families.length !== idx + 1}
                <div class="divider divider-horizontal opacity-30 self-stretch"></div>
            {/if}
        {/each}
    </div>
</div>