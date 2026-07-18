import { redirect } from '@sveltejs/kit';

import { SKIP_REDIRECT_ROUTES } from '$lib/server/common';
import type { LayoutServerLoad } from './$types';
import { SERVER_ENDPOINTS } from '$lib/consts';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	const { pathname } = url;
	if (!locals.isPublic) {
		if (!locals.user && !SKIP_REDIRECT_ROUTES.includes(pathname))
			return redirect(302, SERVER_ENDPOINTS.LOGIN);
		if (locals.user && pathname === SERVER_ENDPOINTS.LOGIN) return redirect(302, '/admin');
	}
	const { user, rbac, menus, config, pageConfig, adminConfig } = locals;
	return {
		config,
		pageConfig,
		...(!!user && { user }),
		...(!!rbac && { rbac }),
		...(!!menus && { menus }),
		...(!!adminConfig && { adminConfig })
	};
};
