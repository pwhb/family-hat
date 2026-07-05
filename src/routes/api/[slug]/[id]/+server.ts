import { APP_ID, DB_NAME } from '$env/static/private';
import { checkAuth } from '$lib/util/server';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { updated } from '$app/state';
import { delCache } from '$lib/util/redis';

export const GET: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies);
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		const data = await col.findOne(
			{ _id: new ObjectId(params.id), isActive: true },
			{
				projection: {
					appId: 0,
					isActive: 0
				}
			}
		);
		if (!data) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies);
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const body = await request.json();
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		const data = await col.findOneAndUpdate(
			{ _id: new ObjectId(params.id) },
			{
				$set: {
					...body,
					updatedAt: new Date(),
					updatedBy: authenticated._id
				}
			},
			{ returnDocument: 'after' }
		);
		if (colName === 'configs' && data) {
			await delCache(data.key);
		}
		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies);
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		// const data = await col.deleteOne({ _id: new ObjectId(params.id) });
		const data = await col.findOneAndUpdate(
			{ _id: new ObjectId(params.id) },
			{
				$set: {
					isActive: false,
					updatedAt: new Date(),
					updatedBy: authenticated._id
				}
			},
			{ returnDocument: 'after' }
		);
		return json({ data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
