import type { PageServerLoad } from './$types';
import { getConfig } from '$lib/server/configs';

export const load: PageServerLoad = async ({ url }) => {
	const [_, admin, slug, action] = url.pathname.split('/');
	const key = `${admin}_${action}_${slug}`.replaceAll('-', '_').toUpperCase();
	const pageConfig = await getConfig(key);
	return {
		key,
		pageConfig: pageConfig
	};
};
