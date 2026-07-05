import { DB_NAME } from '$env/static/private';
import { getToken } from '$lib/server/common';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const token = getToken(request);
	if (!token) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('logs');
	const data = await col.findOneAndUpdate(
		{
			userId: token
		},
		{
			$set: {
				userId: token,
				...body
			}
		},
		{
			upsert: true,
			returnDocument: 'after'
		}
	);
	return json({ data });
};
