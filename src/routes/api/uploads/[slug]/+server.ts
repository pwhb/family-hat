import { json, type RequestHandler } from '@sveltejs/kit';
import { getPresignedUploadUrl, getPresignedUrl } from '$lib/server/s3';

export const GET: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const contentType = request.headers.get('content-type');
		if (typeof contentType !== 'string') {
			return json({ message: 'Invalid Content-Type' }, { status: 400 });
		}
		const key = `${params.slug}/${crypto.randomUUID()}`;
		const url = await getPresignedUploadUrl({ key, contentType });
		const previewUrl = await getPresignedUrl({ key });
		return json({ url, key, previewUrl });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
