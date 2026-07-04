import { APP_ID, DB_NAME, MODE } from '$env/static/private';
import { checkAuth } from '$lib/util/server';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { MongoServerError, type Filter } from 'mongodb';
import { hash } from 'bcrypt';

export const GET: RequestHandler = async ({ params, request, url, cookies }) => {
	try {
		const authenticated = await checkAuth(request, cookies)
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection(params.slug);
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
		const authenticated = await checkAuth(request, cookies)
		if (!authenticated) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		if (params.slug === 'users' && MODE !== 'dev') {
			return json({ message: 'Forbidden' }, { status: 403 });
		}
		const body = await request.json();
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection(params.slug);
		if (params.slug === 'members') {
			// members
			body.code = body.name.en.replace(/\s/g, '_').toUpperCase();
		} else if (params.slug === 'questions') {
			// questions
			if (body.options && body.options.length) {
				for (const idx in body.options) {
					body.options[idx].code = `${body.code}_${idx}`;
				}
			}
		} else if (params.slug === 'relation_types') {
			// relation types
			body.code = `${body.fromLabel.en.replace(/\s/g, '_').toUpperCase()}_${body.toLabel.en.replace(/\s/g, '_').toUpperCase()}`;
		} else if (params.slug === 'users') {
			body.hashedPassword = await hash(body.password, 10)
			body.code = body.name.replace(/\s/g, '_').toUpperCase();
			delete body.password
		}

		const data = await col.insertOne({
			...body,
			isActive: true,
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
