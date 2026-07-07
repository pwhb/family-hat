import { getCleanPath, getPath } from '$lib/server/common';
import { getConfig, getPageConfig } from '$lib/server/configs';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, route }) => {
	const pageUrl = getCleanPath(url.pathname, route.id);
	const [pageConfig, config] = await Promise.all([getPageConfig(pageUrl), getConfig('COMMON')]);
	if (!pageConfig) {
		throw redirect(
			307,
			`/error/missing-config?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
		);
	}
	return {
		config,
		pageConfig
	};
};
