<script lang="ts">
	import { type TreeNode } from '$lib/client/tree';
	interface SimpleNode {
		value: string;
		label: string;
		parent: string | null | '';
	}

	let { nodes = [], checkedValues = $bindable([]) } = $props<{
		nodes: TreeNode<SimpleNode & Record<string, any>>[];
		checkedValues: string[];
	}>();

	function handleCheck(value: string, isChecked: boolean) {
		if (isChecked) {
			if (!checkedValues.includes(value)) checkedValues.push(value);
		} else {
			checkedValues = checkedValues.filter((v: any) => v !== value);
		}
	}
</script>

<div class="max-w-md rounded-xl border border-base-300 bg-base-200 p-4 shadow-inner">
	<div class="flex w-full flex-col gap-1">
		{@render renderBranch(nodes)}
	</div>
</div>

{#snippet renderBranch(branchNodes: typeof nodes)}
	{#each branchNodes as node (node.value)}
		<li class="form-control w-full">
			<div
				class="group flex items-start justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-base-300/50"
			>
				<label class="label flex w-full cursor-pointer justify-start gap-3 p-0 select-none">
					<input
						type="checkbox"
						class="checkbox checkbox-sm checkbox-primary transition-transform active:scale-95"
						checked={checkedValues.includes(node.value)}
						onchange={(e) => handleCheck(node.value, e.currentTarget.checked)}
					/>
					<span class="label-text font-medium text-base-content/90 group-hover:text-base-content">
						{node.label}
					</span>
				</label>
			</div>

			{#if node.children && node.children.length > 0}
				<ul class="my-1 ml-2 flex w-full list-none flex-col gap-1 border-l border-base-300/80 pl-6">
					{@render renderBranch(node.children)}
				</ul>
			{/if}
		</li>
	{/each}
{/snippet}
