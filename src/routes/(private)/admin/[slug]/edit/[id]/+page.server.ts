import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const res = await fetch(`/api/${params.slug}/${params.id}`);
	if (res.ok) {
		const pageData = await res.json();
		return { pageData };
	}
	return {};
};
