import { fillTemplate } from '$lib/client/common';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SERVER_ENDPOINTS } from '$lib/consts';
import { mappers, type MapperKey } from '$lib/server/mappers';
import { mapDeep } from '$lib/server/common';

export const load: PageServerLoad = async ({ params, fetch, locals, url }) => {
	const apiConfig = locals.pageConfig.fetch;
	const res = await fetch(`${fillTemplate(apiConfig.url, params)}`, {
		method: apiConfig.method,
		headers: apiConfig.headers
	});
	if (res.ok) {
		let pageData = await res.json();
		if (locals.pageConfig.privateConfigs && locals.pageConfig.privateConfigs.mapDeepConfigs) {
			for (const { paths, func, key } of locals.pageConfig.privateConfigs.mapDeepConfigs) {
				const mapper = mappers[func as MapperKey];
				if (mapper) {
					pageData = await mapDeep(pageData, paths, mapper, key);
				}
			}
		}
		return { pageData };
	}
	if (res.status === 403) {
		throw redirect(
			307,
			`${SERVER_ENDPOINTS.FORBIDDEN_ERROR}?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
		);
	}
	return {};
};
