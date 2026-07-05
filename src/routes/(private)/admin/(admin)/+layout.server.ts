import { getConfig } from '$lib/util/configs';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { checkAuth, getUserFromToken } from '$lib/util/server';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('admin_token');
	if (!token && url.pathname !== '/admin/login') {
		redirect(302, '/admin/login');
	}
	if (token && url.pathname === '/admin/login') {
		redirect(302, '/admin');
	}
	if (token) {
		const user = await getUserFromToken(token);
		const adminConf = await getConfig('ADMIN_CONFIG');
		return { user, adminConf };
	}
	return {};
};
