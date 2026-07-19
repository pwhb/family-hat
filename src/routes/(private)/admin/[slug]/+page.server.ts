import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url, params }) => {
	const res = await fetch(`/api/${params.slug}${url.search}`);
	if (res.ok) {
		const pageData = await res.json();
		return { pageData };
	}
	return {};
};
