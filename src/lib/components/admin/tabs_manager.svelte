<script lang="ts">
	import { page } from '$app/state';
	import { tabManager } from '$lib/store/tabs.svelte';

	$effect(() => {
		tabManager.syncRoute(page.url.pathname, page.url.pathname + page.url.search, page.url.search);
	});

	function handleClose(e: MouseEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();
		tabManager.closeTab(id);
	}
</script>

<div
	class="tabs-boxed tabs flex gap-1 overflow-x-auto rounded-none border-b border-base-300 bg-base-100 p-1"
>
	<a
		href="/admin"
		class="tab-sm tab {page.url.pathname === '/admin' ? 'tab-active font-semibold' : ''}"
	>
		Dashboard
	</a>

	{#each tabManager.list as tab (tab.id)}
		<div
			class="group flex items-center rounded-md transition-all
            {page.url.pathname === tab.pathname
				? 'bg-primary font-semibold text-primary-content'
				: 'bg-base-200 hover:bg-base-300'}"
		>
			<a
				href={tab.url}
				class="cursor-pointer rounded-l-md px-3 py-1 text-left text-sm text-current no-underline select-none"
			>
				{tab.label}
			</a>

			<button
				type="button"
				onclick={(e) => handleClose(e, tab.id)}
				class="btn mr-1 btn-circle shrink-0 text-xs opacity-60 btn-ghost btn-xs hover:opacity-100"
				aria-label="Close tab"
			>
				✕
			</button>
		</div>
	{/each}
</div>
