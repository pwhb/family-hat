<script lang="ts">
	import { page } from '$app/state';
	import { fillTemplate, formatDateTime, getDeepValue } from '$lib/client/common';
	import CustomLayout from '$lib/components/admin/custom_layout.svelte';
	import Upload from '$lib/components/admin/upload.svelte';
	import { tabManager } from '$lib/store/tabs.svelte';
	import { toastManager } from '$lib/toast.svelte';

	let loading = $state(false);
	let url = $state('');
	const { pageConfig } = page.data;
	let pageData = $state<any>();
	const onclick = async (e: Event) => {
		try {
			loading = true;
			const importConf = page.data.pageConfig.import;
			const res = await fetch(importConf.url, {
				method: importConf.method,
				headers: {
					...importConf.headers
				},
				body: JSON.stringify({
					action: 'import',
					url
				})
			});
			const resJSON = await res.json();
			if (res.ok) {
				toastManager.show({
					message: importConf.successResp
						? fillTemplate(importConf.successResp, resJSON)
						: 'Success',
					type: 'success'
				});
				pageData = resJSON.data;
			} else {
				throw Error(resJSON && resJSON.message ? resJSON.message : 'Error');
			}
		} catch (error: any) {
			toastManager.show({
				message: error && error.message ? error.message : 'Error',
				type: 'error',
				ttl: 3000
			});
		} finally {
			loading = false;
		}
	};

	const oncommit = async (e: Event) => {
		try {
			loading = true;
			const importConf = page.data.pageConfig.import;
			const res = await fetch(importConf.url, {
				method: importConf.method,
				headers: {
					...importConf.headers
				},
				body: JSON.stringify({
					action: 'commit',
					_id: pageData._id
				})
			});
			const resJSON = await res.json();
			if (res.ok) {
				toastManager.show({
					message: importConf.successResp
						? fillTemplate(importConf.successResp, resJSON)
						: 'Success',
					type: 'success'
				});
				pageData = resJSON.data;
			} else {
				throw Error(resJSON && resJSON.message ? resJSON.message : 'Error');
			}
		} catch (error: any) {
			toastManager.show({
				message: error && error.message ? error.message : 'Error',
				type: 'error',
				ttl: 3000
			});
		} finally {
			loading = false;
		}
	};
</script>

<CustomLayout>
	{#if pageData}
		<div class="mb-10 grid grid-cols-2 gap-4">
			{#each pageConfig.viewonlyFields as field}
				<div>
					<legend class="fieldset-legend">{field.name}</legend>
					{#if field.datatype === 'datetime'}
						<p>
							{formatDateTime(getDeepValue(field.key, pageData))}
						</p>
					{:else}
						<p>{getDeepValue(field.key, pageData)}</p>
					{/if}
				</div>
			{/each}
		</div>

		<div class="overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th></th>
						{#each Object.keys(pageConfig.mapping) as header}
							<th>{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each pageData.json as row, idx}
						<tr>
							<th>{idx + 1}</th>
							{#each Object.values(pageConfig.mapping) as key}
								<td>{row[key as string]}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<Upload
			path="imports"
			bind:value={url}
			isImage={false}
			accept={['.csv', '.xlsx', '.xls', '.json', 'text/csv', 'application/json']}
		/>
	{/if}
	<div class="flex w-full gap-4">
		<button
			type="button"
			class="btn flex-1 btn-neutral"
			onclick={() => {
				const formTab = tabManager.list.find((t) => t.pathname === page.url.pathname);
				if (formTab) {
					tabManager.closeTab(formTab.id);
				}
			}}
		>
			Cancel
		</button>
		{#if pageData}
			<button
				type="submit"
				class="btn flex-1 btn-primary"
				onclick={oncommit}
				disabled={loading || !pageData}
			>
				{loading ? 'Committing' : `Commit`}
			</button>
		{:else}
			<button type="submit" class="btn flex-1 btn-primary" {onclick} disabled={loading || !url}>
				{loading ? 'Importing' : `Import`}
			</button>
		{/if}
	</div>
</CustomLayout>
