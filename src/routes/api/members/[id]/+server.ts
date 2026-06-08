import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ params }) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('members');
	const data = await col.findOne({ _id: new ObjectId(params.id) });
	return json({ data });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const body = await request.json();
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('members');
	const data = await col.findOneAndUpdate(
		{ _id: new ObjectId(params.id) },
		{ $set: body },
		{ returnDocument: 'after' }
	);
	return json({ data });
};

export const DELETE: RequestHandler = async ({ params }) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('members');
	const data = await col.deleteOne({ _id: new ObjectId(params.id) });
	return json({ data });
};
