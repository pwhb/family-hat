<script lang="ts">
	import { type TreeNode } from '$lib/client/tree';

	let { nodes = [], checkedValues = $bindable([]) } = $props<{
		nodes: TreeNode[];
		checkedValues: string[];
	}>();

	function handleCheck(value: string, isChecked: boolean) {
		if (isChecked) {
			if (!checkedValues.includes(value)) checkedValues.push(value);
		} else {
			checkedValues = checkedValues.filter((v: any) => v !== value);
		}
	}

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
				<!-- Root Level Node Header -->
				<div class="mb-3 flex items-center justify-between border-b border-base-300/60 pb-1.5">
					{#if rootNode.isCheckbox}
						<!-- Renders a functional checkbox for the root node itself -->
						<label
							class="hover:border-base-400 label inline-flex cursor-pointer gap-2 rounded-md border border-base-300 bg-base-100 px-3 py-1 shadow-sm transition-all select-none hover:bg-base-200"
						>
							<input
								type="checkbox"
								class="checkbox checkbox-xs checkbox-primary transition-transform active:scale-95"
								checked={checkedValues.includes(rootNode.value)}
								onchange={(e) => handleCheck(rootNode.value, e.currentTarget.checked)}
							/>
							<span
								class="label-text text-xs font-bold tracking-wider text-base-content/70 uppercase"
							>
								{rootNode.label}
							</span>
						</label>
					{:else}
						<!-- Fallback pure text heading if a group doesn't have a checkbox -->
						<span class="text-xs font-bold tracking-wider text-base-content/50 uppercase">
							{rootNode.label}
						</span>
					{/if}
				</div>

				<!-- Nested Children Area for Root Node -->
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
	<!-- Check if the immediate layer consists of clean leaf elements to wrap them inline -->
	{@const isActionList = branchNodes.every((n: any) => !n.children || n.children.length === 0)}

	<div class={isActionList ? 'flex flex-wrap gap-2 pt-1' : 'flex flex-col gap-2'}>
		{#each branchNodes as node (node.value)}
			<div class="flex flex-col gap-2">
				<!-- Renders the current branch item checkbox if enabled -->
				{#if node.isCheckbox}
					<label
						class="hover:border-base-400 label inline-flex cursor-pointer gap-2 self-start rounded-md border border-base-300 bg-base-100 px-3 py-1 shadow-sm transition-all select-none hover:bg-base-200"
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
				{:else if node.children && node.children.length > 0}
					<!-- Intermediate textual grouping label if it's not a checkbox -->
					<span class="text-xs font-semibold text-base-content/50 capitalize">
						{node.label}
					</span>
				{/if}

				<!-- Deep nesting recursion down the tree if this child has children of its own -->
				{#if node.children && node.children.length > 0}
					<ul
						class="aggregation-branch my-1 ml-1 flex list-none flex-col border-l border-base-300/80 pl-4"
					>
						{@render renderBranch(node.children)}
					</ul>
				{/if}
			</div>
		{/each}
	</div>
{/snippet}
