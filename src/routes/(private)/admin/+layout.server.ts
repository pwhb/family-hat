import { getConfig } from '$lib/configs';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('admin_token');
	if (!token && url.pathname !== '/admin/login') {
		redirect(302, '/admin/login');
	}
	return {};
};
