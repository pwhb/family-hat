import { getConfig } from '$lib/util/configs';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const data = await getConfig(params.key);
	return json({ data });
};
