import { goto } from '$app/navigation';
import { page } from '$app/state';
import { capitalize } from '$lib/client/common';
import { LocalStorageState } from './local.svelte';

export interface Tab {
	id: string;
	pathname: string;
	url: string;
	label: string;
}

const openTabsStorage = new LocalStorageState<Tab[]>('admin_tabs', []);

export const tabManager = {
	get list() {
		return openTabsStorage.value;
	},

	generateLabel(pathname: string, search: string): string {
		const segments = pathname.split('/').filter(Boolean);
		if (segments.length <= 1) return 'Dashboard';
		const [_, scope, action, id] = segments;

		const entityName = scope
			.split('-')
			.map((v) => capitalize(v))
			.join(' ');

		let queryContext = '';
		if (search) {
			const params = new URLSearchParams(search);
			const searchVal = params.get('q');
			if (searchVal) queryContext = ` - "${searchVal}"`;
		}

		return action
			? `${capitalize(action)} ${entityName.replace(/s$/, '')}${id ? ` [${id}]` : ''}`
			: `${entityName}${queryContext}`;
	},

	syncRoute(pathname: string, fullUrl: string, search: string) {
		if (pathname === '/admin') return;

		const existingTab = openTabsStorage.value.find((t) => t.pathname === pathname);

		if (!existingTab) {
			openTabsStorage.value.push({
				id: `tab-${Date.now()}`,
				pathname,
				url: fullUrl,
				label: this.generateLabel(pathname, search)
			});
		} else if (existingTab.url !== fullUrl) {
			existingTab.url = fullUrl;
			existingTab.label = this.generateLabel(pathname, search);
		}
	},

	async closeTab(id: string, customRedirectUrl?: string) {
		const index = openTabsStorage.value.findIndex((t) => t.id === id);
		if (index === -1) return;

		const targetTab = openTabsStorage.value[index];
		const isCurrentPage = page.url.pathname === targetTab.pathname;

		if (customRedirectUrl) {
			await goto(customRedirectUrl);
		} else if (isCurrentPage) {
			const remaining = openTabsStorage.value.filter((t) => t.id !== id);
			let fallbackUrl = '/admin';

			if (remaining.length > 0) {
				const nextIndex = Math.min(index, remaining.length - 1);
				fallbackUrl = remaining[nextIndex].url;
			}

			await goto(fallbackUrl);
		}

		openTabsStorage.value = openTabsStorage.value.filter((t) => t.id !== id);
	}
};
