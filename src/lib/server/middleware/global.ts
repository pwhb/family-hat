import { redirect, type Handle } from '@sveltejs/kit';
import { getCleanPath } from '../common';
import { getConfig, getPageConfig } from '../configs';
import { SERVER_ENDPOINTS } from '$lib/consts';

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
		console.log('missing-config', locals.pageUrl);
		throw redirect(
			307,
			`${SERVER_ENDPOINTS.MISSING_CONFIG_ERROR}?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
		);
	}
	locals.config = config;
	locals.pageConfig = pageConfig.configs;
	locals.pageName = pageConfig.name;
	locals.pageId = pageConfig._id.toString();
	locals.isPublic = pageConfig.isPublic;
	locals.adminConfig = adminConfig;

	return resolve(event);
};
