<script lang="ts">
	import { page } from '$app/state';
	import { fillTemplate } from '$lib/client/common';
	import { tabManager } from '$lib/store/tabs.svelte';
	import { toastManager } from '$lib/toast.svelte';
	let loading = $state(false);

	let format = $state<'csv' | 'excel' | 'json'>('csv');
	const onclick = async (e: Event) => {
		try {
			loading = true;
			const exportConf = page.data.pageConfig.export;
			const res = await fetch(exportConf.url, {
				method: exportConf.method,
				headers: {
					...exportConf.headers
				},
				body: JSON.stringify({
					format
				})
			});
			const resJSON = await res.json();
			if (res.ok) {
				toastManager.show({
					message: exportConf.successResp
						? fillTemplate(exportConf.successResp, resJSON)
						: 'Success',
					type: 'success'
				});

				const { url } = resJSON;
				if (url) {
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', '');
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
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

<div class="m-4 flex flex-col gap-6 p-4">
	<div class="form-control gap-2">
		<span class="text-sm font-semibold">Export Format</span>

		<div class="grid grid-cols-3 gap-3">
			<div
				class="flex items-center gap-2 rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200"
			>
				<input
					id="format-csv"
					type="radio"
					name="exportFormat"
					value="csv"
					bind:group={format}
					class="radio radio-sm radio-primary"
				/>
				<label for="format-csv" class="cursor-pointer text-sm font-medium">CSV</label>
			</div>

			<div
				class="flex items-center gap-2 rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200"
			>
				<input
					id="format-excel"
					type="radio"
					name="exportFormat"
					value="excel"
					bind:group={format}
					class="radio radio-sm radio-primary"
				/>
				<label for="format-excel" class="cursor-pointer text-sm font-medium">Excel</label>
			</div>

			<div
				class="flex items-center gap-2 rounded-lg border border-base-300 p-3 transition-colors hover:bg-base-200"
			>
				<input
					id="format-json"
					type="radio"
					name="exportFormat"
					value="json"
					bind:group={format}
					class="radio radio-sm radio-primary"
				/>
				<label for="format-json" class="cursor-pointer text-sm font-medium">JSON</label>
			</div>
		</div>
	</div>

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
		<button type="submit" class="btn flex-1 btn-primary" {onclick} disabled={loading}>
			{loading ? 'Exporting' : `Export (${format.toUpperCase()})`}
		</button>
	</div>
</div>
