import { getConfig } from '$lib/util/configs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, request, url }) => {
	const checkCache = url.searchParams.get('checkCache') === 'true';
	const data = await getConfig(params.key, checkCache);
	return json({ data });
};
