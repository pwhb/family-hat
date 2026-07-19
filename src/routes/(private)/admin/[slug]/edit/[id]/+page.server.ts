import { fillTemplate } from '$lib/client/common';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SERVER_ENDPOINTS } from '$lib/consts';

export const load: PageServerLoad = async ({ params, fetch, locals, url }) => {
	const apiConfig = locals.pageConfig.fetch;
	const res = await fetch(`${fillTemplate(apiConfig.url, params)}`, {
		method: apiConfig.method,
		headers: apiConfig.headers
	});
	if (res.ok) {
		const pageData = await res.json();
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
