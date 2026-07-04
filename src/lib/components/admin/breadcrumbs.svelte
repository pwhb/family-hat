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
					split[2] === 'me'
						? `/${split[1]}/${split[2]}`
						: `/${split[1]}/${split[2]}${page.url.search || '?page=1&size=10'}`
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

	const isListPage = (pathname: string) => {
		const split = pathname.split('/');
		if (split.length === 3 && split[2] !== 'me') {
			return true;
		}
		return false;
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
	<div>
		{#if isListPage(page.url.pathname)}
			<a class="btn btn-sm btn-primary" href={`${page.url.pathname}/create`}>Create</a>
		{/if}
	</div>
</div>
