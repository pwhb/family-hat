import { DB_NAME } from '$env/static/private';
import { getToken } from '$lib/common';
import clientPromise from '$lib/db';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({}) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('logs');
	const data = await col.find({}).toArray();
	return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const token = getToken(request);
	if (!token) {
		throw error(401, 'Unauthorized');
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
