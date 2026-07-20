<script lang="ts">
	import { page } from '$app/state';
	import { fillTemplate } from '$lib/client/common';

	let { row } = $props<{
		row: Record<string, any>;
	}>();

	function clickOutside(node: HTMLDetailsElement) {
		function handleClick(event: MouseEvent) {
			if (node.open && !node.contains(event.target as Node)) {
				node.open = false;
			}
		}

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	function handleToggle(event: Event) {
		const detailsElem = event.currentTarget as HTMLDetailsElement;

		if (detailsElem.open) {
			requestAnimationFrame(() => {
				const menuElem = detailsElem.querySelector('.dropdown-content');
				if (menuElem) {
					menuElem.scrollIntoView({
						behavior: 'smooth',
						block: 'nearest'
					});
				}
			});
		}
	}

	function handleActionClick(event: MouseEvent, action: any, ctx: any) {
		const detailsElem = (event.target as HTMLElement).closest('details');
		if (detailsElem) detailsElem.open = false;
		if (action.handler) {
			action.handler(ctx);
		}
	}
</script>

{#if page.data.pageConfig.actions && page.data.pageConfig.actions.inline && page.data.pageConfig.actions.inline.length}
	<details class="dropdown dropdown-end" use:clickOutside ontoggle={handleToggle}>
		<summary class="btn cursor-pointer btn-sm btn-secondary select-none"> Actions </summary>

		<ul
			class="dropdown-content menu z-50 w-40 rounded-box border border-base-200 bg-base-200 shadow"
		>
			{#each page.data.pageConfig.actions.inline as action (action.key)}
				{#if action.requiredPermission.some((v: string) => page.data.rbac.permissions.includes(v))}
					<li>
						{#if action.url}
							<a
								href={fillTemplate(action.url, row)}
								onclick={(e) => handleActionClick(e, action, { row })}
							>
								{action.label}
							</a>
						{:else}
							<button type="button" onclick={(e) => handleActionClick(e, action, { row })}>
								{action.label}
							</button>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
	</details>
{/if}
