<script>
	import { page } from '$app/state';
	import { getDeepValue } from '$lib/client/common';
</script>

<div class="grid grid-cols-2 gap-10 p-10">
	{#each page.data.pageConfig.blocks as block}
		<div class="stat rounded-2xl shadow-lg">
			<div class="stat-title text-xl">{block.name}</div>
			<div class="stat-value">
				<span class="text-green-600">{getDeepValue(page.data.pageData, block.count)} </span>
				/
				{getDeepValue(page.data.pageData, block.total)}
			</div>
			<div class="stat-actions">
				<a class="btn p-4 btn-xs btn-neutral" href={block.url}>View {block.name}</a>
			</div>
		</div>
	{/each}
</div>
