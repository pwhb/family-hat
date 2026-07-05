import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { getConfig } from '$lib/util/configs';
import type { Document, Filter } from 'mongodb';
import { createLookUpSlice } from '$lib/util/server';

export const load: PageServerLoad = async ({ cookies, url, params }) => {
	const client = await clientPromise;
	const colName = params.slug.replaceAll('-', '_');
	const col = client.db(DB_NAME).collection(colName);
	const page = Number(url.searchParams.get('page'));
	const size = Number(url.searchParams.get('size'));
	const q = url.searchParams.get('q');
	const query: Filter<any> = {};
	if (q) {
		if (['families', 'members'].includes(colName)) {
			query['$or'] = [
				{
					'name.en': { $regex: q, $options: 'i' }
				},
				{
					'name.my': { $regex: q, $options: 'i' }
				}
			];
		} else if (['configs', 'users'].includes(colName)) {
			query['$or'] = [
				{
					name: { $regex: q, $options: 'i' }
				}
			];
		} else if (['relation_types'].includes(colName)) {
			query['$or'] = [
				{
					code: { $regex: q, $options: 'i' }
				}
			];
		} else if (['relationships'].includes(colName)) {
			const members = await client
				.db(DB_NAME)
				.collection('members')
				.find({
					$or: [
						{
							'name.en': { $regex: q, $options: 'i' }
						},
						{
							'name.my': { $regex: q, $options: 'i' }
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
					code: { $regex: q, $options: 'i' }
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
	const [_, admin, slug] = url.pathname.split('/');
	const key = `${admin}_list_${slug}`.replaceAll('-', '_').toUpperCase();
	const pageConfig = await getConfig(key);
	return {
		key,
		pageData: {
			page,
			size,
			data,
			count
		},
		pageConfig: pageConfig
	};
};
