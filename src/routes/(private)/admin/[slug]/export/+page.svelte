<script lang="ts">
	import { page } from '$app/state';
	import { fillTemplate } from '$lib/client/common';
	import { tabManager } from '$lib/store/tabs.svelte';
	import { toastManager } from '$lib/toast.svelte';

	const obj = {};
	const onclick = async (e: Event) => {
		try {
			const exportConf = page.data.pageConfig.export;
			const res = await fetch(exportConf.url, {
				method: exportConf.method,
				headers: {
					...exportConf.headers
				},
				body: JSON.stringify(obj)
			});
			const resJSON = await res.json();
			if (res.ok) {
				toastManager.show({
					message: exportConf.successResp
						? fillTemplate(exportConf.successResp, resJSON)
						: 'Success',
					type: 'success'
				});
			} else {
				throw Error(resJSON && resJSON.message ? resJSON.message : 'Error');
			}
		} catch (error: any) {
			toastManager.show({
				message: error && error.message ? error.message : 'Error',
				type: 'error',
				ttl: 3000
			});
		}
	};
</script>

<div class="m-4 p-4">
	<div class="flex w-full gap-4">
		<button
			type="button"
			class="btn flex-1 btn-neutral"
			onclick={() => {
				const formTab = tabManager.list.find((t) => t.pathname === page.url.pathname);
				if (formTab) {
					tabManager.closeTab(formTab.id);
				}
			}}>Cancel</button
		>
		<button type="submit" class="btn flex-1 btn-primary" {onclick}>Export</button>
	</div>
</div>
