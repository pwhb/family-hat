import { checkAuth } from '$lib/util/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPresignedUploadUrl } from '$lib/util/s3';

export const GET: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies);
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		const body = await request.json();
		const key = `${crypto.randomUUID()}`;
		const url = await getPresignedUploadUrl(key, body.contentType);
		return json({ url, key });
	} catch (error) {
		console.log(error);
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
