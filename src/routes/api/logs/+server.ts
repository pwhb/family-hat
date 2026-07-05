import { DB_NAME } from '$env/static/private';
import { getToken } from '$lib/server/common';
import clientPromise from '$lib/db';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const token = getToken(request);
	if (!token) {
		return json({ message: 'Unauthorized' }, { status: 401 });
	}
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('logs');
	const data = await col.findOne({ userId: token });
	return json({ data });
};

// export const POST: RequestHandler = async ({ request }) => {
// 	const body = await request.json();
// 	const auth = request.headers.get('authorization');
// 	if (!auth) {
// 		throw new Error('Unauthorized');
// 	}
// 	const client = await clientPromise;
// 	const col = client.db(DB_NAME).collection('logs');
// 	const data = await col.insertOne(body);
// 	return json({ data });
// };
