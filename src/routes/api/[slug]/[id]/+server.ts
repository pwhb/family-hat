import { DB_NAME } from '$env/static/private';
import { createLookUpSlice } from '$lib/server/common';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { ObjectId, type Document, type Filter } from 'mongodb';
import { decrypt, encrypt } from '$lib/server/crypto';
import { delCache } from '$lib/server/redis';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		const query: Filter<any> = locals.query;
		const pipeline: Document[] = [
			{
				$match: {
					...query,
					_id: new ObjectId(params.id)
				}
			},
			...createLookUpSlice({
				from: 'users',
				localField: 'createdBy',
				foreignField: '_id',
				as: 'createdByUser',
				opts: {
					project: { name: 1, username: 1 }
				}
			}),
			...createLookUpSlice({
				from: 'users',
				localField: 'updatedBy',
				foreignField: '_id',
				as: 'updatedByUser',
				opts: {
					project: { name: 1, username: 1 }
				}
			}),
			{
				$project: {
					appId: 0
				}
			},
			{
				$limit: 1
			}
		];

		const list = await col.aggregate(pipeline).toArray();
		const data = list[0];
		if (colName === 'configs' && data.type === 'secured') {
			data.value = await decrypt(data.value);
		}
		if (!data) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const body = await request.json();
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		if (colName === 'configs' && body) {
			if (body.key) {
				await delCache(body.key);
			}
			if (body.type && body.type === 'secured') {
				body.value = await encrypt(body.value);
			}
		}
		const query: Filter<any> = locals.query;
		const data = await col.findOneAndUpdate(
			{
				...query,
				_id: new ObjectId(params.id)
			},
			{
				$set: {
					...body,
					updatedAt: new Date(),
					updatedBy: locals.user._id
				}
			},
			{ returnDocument: 'after' }
		);

		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		const query: Filter<any> = locals.query;
		// const data = await col.deleteOne({ _id: new ObjectId(params.id) });
		const data = await col.findOneAndUpdate(
			{
				...query,
				_id: new ObjectId(params.id)
			},
			{
				$set: {
					isActive: false,
					updatedAt: new Date(),
					updatedBy: locals.user._id
				}
			},
			{ returnDocument: 'after' }
		);
		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
