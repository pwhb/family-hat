import { getConfig } from '$lib/configs';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const key = `PAGE${url.pathname.replace(/\/|-/g, '_').toUpperCase()}`;
	const page = await getConfig(key);
	const config = await getConfig('COMMON');
	return {
		config,
		page
	};
};
