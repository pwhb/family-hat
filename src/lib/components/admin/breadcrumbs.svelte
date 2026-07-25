<script lang="ts">
	import { page } from '$app/state';
	const createBreadcrumbs = (pathname: string) => {
		const split = pathname.split('/');
		const list = [
			{
				label: split[1],
				url: `/${split[1]}`
			}
		];
		if (split[2]) {
			list.push({
				label: split[2],
				url:
					split[2] === 'me' ? `/${split[1]}/${split[2]}` : `/${split[1]}/${split[2]}?page=1&size=10`
			});
		}
		if (split[3] && split[4]) {
			list.push({
				label: `${split[3]} ${split[4]}`,
				url: `/${split[1]}/${split[2]}/${split[3]}/${split[4]}`
			});
		}
		return list;
	};
</script>

<div class="mx-10 flex items-center justify-between">
	<div class="m-4 breadcrumbs text-sm">
		<ul>
			{#each createBreadcrumbs(page.url.pathname) as item}
				<li class=" capitalize"><a href={item.url}>{item.label}</a></li>
			{/each}
		</ul>
	</div>
	<div class="flex gap-2">
		{#if page.data.pageConfig.actions && page.data.pageConfig.actions.header && page.data.pageConfig.actions.header.length}
			{#each page.data.pageConfig.actions.header as action}
				{#if action.requiredPermission.some((v: string) => page.data.rbac.permissions.includes(v))}
					{#if action.url}
						{#if action.key === 'create'}
							<a class="btn btn-sm btn-primary" href={action.url}>{action.label}</a>
						{:else}
							<a class="btn btn-sm btn-neutral" href={action.url}>{action.label}</a>
						{/if}
					{/if}
				{/if}
			{/each}
		{/if}
	</div>
</div>
