import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { getConfig, getPageConfig } from '$lib/server/configs';
import { getCleanPath, getPath, getUserFromToken } from '$lib/server/common';

export const load: LayoutServerLoad = async ({ route, cookies, url }) => {
	const token = cookies.get('admin_token');
	if (!token && url.pathname !== '/admin/login') {
		redirect(302, '/admin/login');
	}
	if (token && url.pathname === '/admin/login') {
		redirect(302, '/admin');
	}
	if (token) {
		const pageUrl = getCleanPath(url.pathname, route.id);
		const [user, adminConf, config, pageConfig] = await Promise.all([
			getUserFromToken(token),
			getConfig('ADMIN_CONFIG'),
			getConfig('COMMON'),
			getPageConfig(pageUrl)
		]);
		if (!pageConfig) {
			throw redirect(
				307,
				`/error/missing-config?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
			);
		}
		return { user, adminConf, config, pageConfig };
	}
	return {};
};
