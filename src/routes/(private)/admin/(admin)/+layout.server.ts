import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { getConfig } from '$lib/server/configs';
import { getUserFromToken } from '$lib/server/common';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('admin_token');
	if (!token && url.pathname !== '/admin/login') {
		redirect(302, '/admin/login');
	}
	if (token && url.pathname === '/admin/login') {
		redirect(302, '/admin');
	}
	if (token) {
		const [user, adminConf, config] = await Promise.all([
			getUserFromToken(token),
			getConfig('ADMIN_CONFIG'),
			getConfig('COMMON')
		]);

		return { user, adminConf, config };
	}
	return {};
};
