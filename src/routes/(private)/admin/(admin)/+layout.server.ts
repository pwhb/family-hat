import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { getConfig, getPageConfig } from '$lib/server/configs';
import { ADMIN_TOKEN, getCleanPath, getUserFromToken, SERVER_ENDPOINTS } from '$lib/server/common';

export const load: LayoutServerLoad = async ({ route, cookies, url }) => {
	const token = cookies.get(ADMIN_TOKEN);
	if (!token && url.pathname !== SERVER_ENDPOINTS.LOGIN) {
		redirect(302, SERVER_ENDPOINTS.LOGIN);
	}
	if (token && url.pathname === SERVER_ENDPOINTS.LOGIN) {
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
		if (!user) {
			cookies.delete(ADMIN_TOKEN, {
				path: '/'
			});
			return redirect(301, SERVER_ENDPOINTS.LOGIN);
		}
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
