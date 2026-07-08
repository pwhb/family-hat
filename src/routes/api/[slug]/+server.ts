import { APP_ID, DB_NAME, MODE } from '$env/static/private';
import { checkAuth, COL_LIST } from '$lib/server/common';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { MongoServerError, type Filter } from 'mongodb';
import { hash } from 'bcrypt';
import { encrypt } from '$lib/server/crypto';

export const GET: RequestHandler = async ({ params, request, url, cookies }) => {
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
		if (!COL_LIST.includes(colName)) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const col = client.db(DB_NAME).collection(colName);
		const query: Filter<any> = { isActive: true };
		url.searchParams.forEach((value, key) => {
			if (key === 'q') {
				query['$or'] = [
					{
						'name.en': { $regex: value, $options: 'i' }
					},
					{
						'name.my': { $regex: value, $options: 'i' }
					},
					{
						code: { $regex: value, $options: 'i' }
					}
				];
			}
			if (key === 'isLeaf' && value === 'true') {
				query['url'] = '';
			}
		});
		let page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1;
		let size = url.searchParams.get('size') ? Number(url.searchParams.get('size')) : 10;
		const count = await col.countDocuments(query);
		const data = await col
			.find(query, {
				projection: {
					appId: 0,
					isActive: 0
				},
				skip: (page - 1) * size,
				limit: size
			})
			.toArray();
		return json({ page, size, count, data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies);
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		if (params.slug === 'users' && MODE !== 'dev') {
			return json({ message: 'Creating a new user is only allowed in dev mode.' }, { status: 403 });
		}
		const body = await request.json();
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		if (!COL_LIST.includes(colName)) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const col = client.db(DB_NAME).collection(colName);
		if (colName === 'members') {
			// members
			body.code = body.name.en.replace(/\s/g, '_').toUpperCase();
		} else if (colName === 'questions') {
			// questions
			if (body.options && body.options.length) {
				for (const idx in body.options) {
					body.options[idx].code = `${body.code}_${idx}`;
				}
			}
		} else if (colName === 'relation_types') {
			// relation types
			body.code = `${body.sourceLabel.en.replace(/\s/g, '_').toUpperCase()}_${body.targetLabel.en.replace(/\s/g, '_').toUpperCase()}`;
		} else if (colName === 'users') {
			body.hashedPassword = await hash(body.password, 10);
			body.code = body.name.replace(/\s/g, '_').toUpperCase();
			delete body.password;
		} else if (colName === 'configs' && body.type && body.type === 'secured') {
			body.value = await encrypt(body.value);
		}

		const data = await col.insertOne({
			...body,
			isActive: !!body.isActive,
			appId: APP_ID,
			createdBy: authenticated._id,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		return json({ data });
	} catch (error) {
		if (error instanceof MongoServerError) {
			if (error.code === 11000) {
				return json({ message: 'Duplicate Key Error' }, { status: 409 });
			}
		}
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
