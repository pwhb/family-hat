import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';
import { SERVER_ENDPOINTS } from '$lib/server/common';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	if (!locals.user && url.pathname !== SERVER_ENDPOINTS.LOGIN)
		return redirect(302, SERVER_ENDPOINTS.LOGIN);
	if (locals.user && url.pathname === SERVER_ENDPOINTS.LOGIN) return redirect(302, '/admin');
	const { user, pageConfig, adminConfig } = locals;
	return {
		user,
		pageConfig: pageConfig.configs,
		adminConfig: adminConfig
	};
};
