import { getConfig } from '$lib/configs';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const data = await getConfig(params.key || '');
    if (!data) {
        throw new Error('Not found');
    }
	return json(data);
};
