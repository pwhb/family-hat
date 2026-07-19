import { APP_ID, DB_NAME, MODE } from '$env/static/private';
import { createLookUpSlice } from '$lib/server/common';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { MongoServerError, type Document, type Filter } from 'mongodb';
import { hash } from 'bcrypt';
import { encrypt } from '$lib/server/crypto';
import { COL_LIST } from '$lib/consts';

export const GET: RequestHandler = async ({ params, request, url, cookies, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const client = await clientPromise;
		const colName = params.slug.replaceAll('-', '_');
		const col = client.db(DB_NAME).collection(colName);
		const page = Number(url.searchParams.get('page'));
		const size = Number(url.searchParams.get('size'));
		const query: Filter<any> = {};
		for (let [key, value] of url.searchParams) {
			if (key === 'q') {
				if (['families', 'members'].includes(colName)) {
					query['$or'] = [
						{
							'name.en': { $regex: value, $options: 'i' }
						},
						{
							'name.my': { $regex: value, $options: 'i' }
						}
					];
				} else if (['configs', 'users', 'pages'].includes(colName)) {
					query['$or'] = [
						{
							name: { $regex: value, $options: 'i' }
						}
					];
				} else if (['relation_types'].includes(colName)) {
					query['$or'] = [
						{
							code: { $regex: value, $options: 'i' }
						}
					];
				} else if (['relationships'].includes(colName)) {
					const members = await client
						.db(DB_NAME)
						.collection('members')
						.find({
							$or: [
								{
									'name.en': { $regex: value, $options: 'i' }
								},
								{
									'name.my': { $regex: value, $options: 'i' }
								}
							]
						})
						.project({ id: { $toString: '$_id' } })
						.toArray();
					const memberIDs = members.map((v) => v.id);
					const relationTypes = await client
						.db(DB_NAME)
						.collection('relation_types')
						.find({
							code: { $regex: value, $options: 'i' }
						})
						.project({ id: { $toString: '$_id' } })
						.toArray();
					const relationTypesIDs = relationTypes.map((v) => v.id);
					query['$or'] = [
						{
							sourceID: { $in: memberIDs }
						},
						{
							targetID: { $in: memberIDs }
						},
						{
							relationTypeID: { $in: relationTypesIDs }
						}
					];
				}
			} else if (['true', 'false'].includes(value)) {
				const v = JSON.parse(value);
				if (key === 'isLeaf') {
					query['url'] = v ? '' : { $ne: '' };
				} else {
					query[key] = v;
				}
			}
		}

		const pipeline: Document[] = [
			{
				$match: query
			},
			{
				$project: {
					appId: 0,
					hashedPassword: 0
				}
			},
			{
				$sort: {
					_id: -1
				}
			},
			{
				$skip: (page - 1) * size
			},
			{
				$limit: size
			}
		];

		if (colName === 'members') {
			const lookupSlice = createLookUpSlice({
				from: 'families',
				localField: 'familyID',
				foreignField: '_id',
				as: 'family'
			});
			const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
			if (matchIndex !== -1) {
				pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
			}
		} else if (colName === 'menus') {
			const lookupSlice = createLookUpSlice({
				from: 'menus',
				localField: 'parentID',
				foreignField: '_id',
				as: 'parent'
			});
			const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
			if (matchIndex !== -1) {
				pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
			}
		} else if (colName === 'relationships') {
			const lookupSlice = [
				...createLookUpSlice({
					from: 'members',
					localField: 'sourceID',
					foreignField: '_id',
					as: 'sourceMember'
				}),
				...createLookUpSlice({
					from: 'members',
					localField: 'targetID',
					foreignField: '_id',
					as: 'targetMember'
				}),
				...createLookUpSlice({
					from: 'relation_types',
					localField: 'relationTypeID',
					foreignField: '_id',
					as: 'relationType'
				})
			];
			const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
			if (matchIndex !== -1) {
				pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
			}
		}
		const count = await col.countDocuments(query);
		const data = await col.aggregate(pipeline).toArray();
		return json({ page, size, count, data });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
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
		} else if (['user_roles'].includes(colName)) {
			body.code = body.name.replace(/\s/g, '_').toUpperCase();
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
			createdBy: locals.user._id,
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
