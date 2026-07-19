import { fillTemplate } from '$lib/client/common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url, params, locals }) => {
	const apiConfig = locals.pageConfig.fetch;
	const res = await fetch(`${fillTemplate(apiConfig.url, params)}${url.search}`, {
		method: apiConfig.method,
		headers: apiConfig.headers
	});
	if (res.ok) {
		const pageData = await res.json();
		return { pageData };
	}
	return {};
};
