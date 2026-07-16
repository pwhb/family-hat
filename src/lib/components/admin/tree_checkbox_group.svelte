<script lang="ts">
	import { type TreeNode } from '$lib/client/tree';

	let { nodes = [], checkedValues = $bindable([]) } = $props<{
		nodes: TreeNode[];
		checkedValues: string[];
	}>();

	// Standard single checkbox handler
	function handleCheck(value: string, isChecked: boolean) {
		if (isChecked) {
			if (!checkedValues.includes(value)) checkedValues.push(value);
		} else {
			checkedValues = checkedValues.filter((v: any) => v !== value);
		}
	}

	// Deeply extracts all leaf checkbox values underneath a given node
	function getAllLeafValues(node: TreeNode): string[] {
		let values: string[] = [];
		if (node.isCheckbox) {
			values.push(node.value);
		}
		if (node.children) {
			for (const child of node.children) {
				values = [...values, ...getAllLeafValues(child)];
			}
		}
		return values;
	}

	// Toggles all child checkboxes under a structural node
	function toggleAllChildren(node: TreeNode) {
		const leafValues = getAllLeafValues(node);
		if (leafValues.length === 0) return;

		// Check if all children under this node are currently checked
		const allChecked = leafValues.every((val) => checkedValues.includes(val));

		if (allChecked) {
			// Uncheck all: Filter out any values belonging to this subtree
			checkedValues = checkedValues.filter((val: any) => !leafValues.includes(val));
		} else {
			// Check all: Add missing values without creating duplicates
			const valuesToAdd = leafValues.filter((val) => !checkedValues.includes(val));
			checkedValues = [...checkedValues, ...valuesToAdd];
		}
	}

	// Dynamic grid columns for root elements
	const gridColsClass = $derived(
		nodes.length === 1
			? 'grid-cols-1'
			: nodes.length === 2
				? 'grid-cols-1 md:grid-cols-2'
				: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
	);
</script>

<div class="w-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
	<div class="grid gap-6 {gridColsClass}">
		{#each nodes as rootNode (rootNode.value)}
			<div class="flex flex-col rounded-lg border border-base-200 bg-base-200/30 p-4 shadow-inner">
				<!-- Root Category Header converted into a clickable action utility button -->
				<div class="mb-3 flex items-center justify-between border-b border-base-300/60 pb-1.5">
					<button
						type="button"
						onclick={() => toggleAllChildren(rootNode)}
						class="text-left text-xs font-bold tracking-wider text-base-content/70 uppercase transition-colors hover:text-primary"
					>
						{rootNode.label}
					</button>
				</div>

				{#if rootNode.children && rootNode.children.length > 0}
					<ul class="flex list-none flex-col gap-2">
						{@render renderBranch(rootNode.children)}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
</div>

{#snippet renderBranch(branchNodes: typeof nodes)}
	{@const isActionList = branchNodes[0]?.isCheckbox}

	<div class={isActionList ? 'flex flex-wrap gap-2 pt-1' : 'flex flex-col gap-2'}>
		{#each branchNodes as node (node.value)}
			{#if node.isCheckbox}
				<!-- Leaf Level Checkboxes -->
				<label
					class="hover:border-base-400 label inline-flex cursor-pointer gap-2 rounded-md border border-base-300 bg-base-100 px-3 py-1 shadow-sm transition-all select-none hover:bg-base-200"
				>
					<input
						type="checkbox"
						class="checkbox checkbox-xs checkbox-primary transition-transform active:scale-95"
						checked={checkedValues.includes(node.value)}
						onchange={(e) => handleCheck(node.value, e.currentTarget.checked)}
					/>
					<span class="label-text text-xs font-medium text-base-content/90">
						{node.label}
					</span>
				</label>
			{:else}
				<!-- Intermediary Structural/Scope Labels converted into interactive action buttons -->
				<li class="form-control w-full list-none">
					<div class="mb-1 text-left">
						<button
							type="button"
							onclick={() => toggleAllChildren(node)}
							class="text-xs font-semibold text-base-content/50 capitalize transition-colors hover:text-primary"
						>
							{node.label}
						</button>
					</div>

					{#if node.children && node.children.length > 0}
						<ul class="my-1 ml-1 flex list-none flex-col border-l border-base-300/80 pl-4">
							{@render renderBranch(node.children)}
						</ul>
					{/if}
				</li>
			{/if}
		{/each}
	</div>
{/snippet}
