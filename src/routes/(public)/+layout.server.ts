import { getConfig } from '$lib/configs';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const key = `PAGE${url.pathname.replace(/\/|-/g, '_').toUpperCase()}`;
	let page;
	if (key !== 'PAGE_') {
		page = await getConfig(key);
	}
	const config = await getConfig('PAGE_');
	return {
		config,
		page
	};
};
