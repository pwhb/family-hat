import { getConfig } from '$lib/server/configs';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, params }) => {
	let cleaned = url.pathname.replace(/\/|-/g, '_');
	for (let [key, value] of Object.entries(params)) {
		cleaned = cleaned.replace(value, key);
	}
	const key = `PAGE${cleaned}`.toUpperCase();
	const [page, config] = await Promise.all([getConfig(key), getConfig('COMMON')]);
	return {
		key,
		config,
		page
	};
};
