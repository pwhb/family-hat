import { fillTemplate } from '$lib/client/common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, locals }) => {
	const apiConfig = locals.pageConfig.fetch;
	const res = await fetch(`${fillTemplate(apiConfig.url, params)}`, {
		method: apiConfig.method,
		headers: apiConfig.headers
	});
	if (res.ok) {
		const pageData = await res.json();
		return { pageData };
	}
	return {};
};
