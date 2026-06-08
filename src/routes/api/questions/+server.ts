import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({}) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('questions');
	const data = await col.find({}).toArray();
	return json({ data });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('questions');
	if (body.options && body.options.length) {
		for (const idx in body.options) {
			body.options[idx].code = `${body.code}_${idx}`;
		}
	}
	const data = await col.insertOne(body);
	return json({ data });
};
