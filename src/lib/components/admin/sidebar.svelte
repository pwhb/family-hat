<script lang="ts">
	import { page } from '$app/state';
	import { buildTree } from '$lib/client/tree';

	const treeMenus = $derived(buildTree(page.data.menus || []));

	let rawSearchTerm = $state('');
	let debouncedSearchTerm = $state('');
	let timeoutId: ReturnType<typeof setTimeout>;

	$effect(() => {
		clearTimeout(timeoutId);
		if (!rawSearchTerm) {
			debouncedSearchTerm = '';
			return;
		}
		timeoutId = setTimeout(() => {
			debouncedSearchTerm = rawSearchTerm.trim().toLowerCase();
		}, 250);

		return () => clearTimeout(timeoutId);
	});

	function filterTree(nodes: any[], query: string): any[] {
		if (!query) return nodes;

		return nodes
			.map((node) => {
				if (node.children && node.children.length > 0) {
					const filteredChildren = filterTree(node.children, query);
					if (filteredChildren.length > 0) {
						return { ...node, children: filteredChildren };
					}
				}

				const nodeName = (node.name || node.label || '').toLowerCase();
				if (nodeName.includes(query)) {
					return { ...node };
				}

				return null;
			})
			.filter(Boolean);
	}

	const filteredMenus = $derived(filterTree(treeMenus, debouncedSearchTerm));
</script>

<div class="drawer-side is-drawer-close:overflow-visible">
	<label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
	<div
		class="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:hidden is-drawer-open:w-64"
	>
		<div class="w-full px-3 pt-4 pb-2">
			<label class="input input-sm flex items-center gap-2 input-ghost bg-base-100">
				<input type="text" placeholder="Search" class="grow text-xs" bind:value={rawSearchTerm} />
				{#if rawSearchTerm}
					<button
						type="button"
						class="btn h-auto min-h-0 p-0 text-base-content/40 btn-ghost btn-xs hover:text-base-content"
						onclick={() => (rawSearchTerm = '')}
					>
						✕
					</button>
				{/if}
			</label>
		</div>

		<ul class="menu w-full grow gap-0.5 overflow-y-auto px-3 pb-4">
			{#if filteredMenus.length === 0}
				<li class="py-4 text-center text-xs text-base-content/40 select-none">
					No matching menus found
				</li>
			{:else}
				{@render renderMenuBranch(filteredMenus)}
			{/if}

			<div class="grow"></div>

			<li class="mt-auto w-full border-t border-base-300/60 pt-4">
				<form action="/admin?/logout" method="POST" class="flex p-0">
					<button
						class="btn w-full content-center btn-outline btn-sm btn-error is-drawer-close:hidden"
						type="submit"
					>
						Logout
					</button>
				</form>
			</li>
		</ul>
	</div>
</div>

{#snippet renderMenuBranch(branchNodes: any[])}
	{#each branchNodes as node (node.value)}
		<li>
			{#if node.children && node.children.length > 0}
				<details open>
					<summary
						class="cursor-pointer text-xs font-semibold tracking-wide text-base-content/70 uppercase select-none"
					>
						{node.name || node.label}
					</summary>
					<ul>
						{@render renderMenuBranch(node.children)}
					</ul>
				</details>
			{:else}
				<a
					href={node.url || '#'}
					class="rounded-lg py-2 text-sm font-medium text-base-content/90 transition-colors hover:bg-base-300/60 is-drawer-close:hidden"
				>
					<span class="is-drawer-close:hidden">{node.name || node.label}</span>
				</a>
			{/if}
		</li>
	{/each}
{/snippet}
