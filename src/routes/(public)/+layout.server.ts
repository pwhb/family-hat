import { getConfig } from '$lib/configs';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url, params }) => {
	let cleaned = url.pathname.replace(/\/|-/g, '_');
	for (let [key, value] of Object.entries(params)) {
		cleaned = cleaned.replace(value, key);
	}
	const key = `PAGE${cleaned}`.toUpperCase();
	const page = await getConfig(key);
	const config = await getConfig('COMMON');
	return {
		key,
		config,
		page
	};
};
