import { redirect, type Handle } from '@sveltejs/kit';
import { getCleanPath, SERVER_ENDPOINTS } from '../common';
import { getConfig, getPageConfig } from '../configs';

const ROUTE_WHITELIST = ['login', 'error', 'api'];
export const globalGuard: Handle = async ({ event, resolve }) => {
	const { locals, url, route } = event;
	locals.pageUrl = getCleanPath(url.pathname, route.id);

	const [_, identifier] = locals.pageUrl.split('/');
	locals.identifier = identifier;
	if (ROUTE_WHITELIST.includes(identifier) || locals.pageUrl === SERVER_ENDPOINTS.LOGIN) {
		return resolve(event);
	}
	const [pageConfig, config, adminConfig] = await Promise.all([
		getPageConfig(locals.pageUrl),
		getConfig('COMMON'),
		...(identifier === 'admin' ? [getConfig('ADMIN_CONFIG')] : [])
	]);
	if (!pageConfig) {
		throw redirect(
			307,
			`/error/missing-config?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
		);
	}
	locals.config = config;
	locals.pageConfig = pageConfig.configs;
	locals.isPublic = pageConfig.isPublic;
	locals.adminConfig = adminConfig;

	return resolve(event);
};
