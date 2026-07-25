import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { ObjectId } from 'mongodb';
import { createLookUpSlice, mapDeep } from '$lib/server/common';
import { mappers, type MapperKey } from '$lib/server/mappers';

export const load: PageServerLoad = async ({ params, locals }) => {
	const client = await clientPromise;
	const { privateConfigs } = locals.pageConfig;
	const relationshipsCol = client.db(DB_NAME).collection('relationships');
	const relationships = await relationshipsCol
		.aggregate([
			{
				$match: {
					$or: [
						{
							sourceID: params.id
						},
						{
							targetID: params.id
						}
					]
				}
			},
			...createLookUpSlice({
				from: 'relation_types',
				localField: 'relationTypeID',
				foreignField: '_id',
				as: 'relationType'
			}),
			{
				$project: privateConfigs.query.relationships.project
			}
		])
		.toArray();
	const memberIDs: string[] = [params.id];
	relationships.forEach((rel) => {
		if (!memberIDs.includes(rel.sourceID)) {
			memberIDs.push(rel.sourceID);
		}
		if (!memberIDs.includes(rel.targetID)) {
			memberIDs.push(rel.targetID);
		}
	});
	const membersCol = client.db(DB_NAME).collection('members');
	const families = await membersCol
		.aggregate([
			{
				$match: { isActive: true, _id: { $in: memberIDs.map((v) => new ObjectId(v)) } }
			},
			{
				$group: {
					_id: '$familyID',
					members: {
						$push: {
							_id: { $toString: '$_id' },
							...privateConfigs.query.members.project
						}
					}
				}
			},
			...createLookUpSlice({
				from: 'families',
				localField: '_id',
				foreignField: '_id',
				as: 'family',
				opts: {
					project: privateConfigs.query.families.project
				}
			})
		])
		.toArray();
	const member = families[0].members.find((v: any) => v._id === params.id);

	let pageData = { families, relationships, member };
	if (privateConfigs && privateConfigs.mapDeepConfigs) {
		for (const { paths, func, key } of privateConfigs.mapDeepConfigs) {
			const mapper = mappers[func as MapperKey];
			if (mapper) {
				pageData = await mapDeep(pageData, paths, mapper, key);
			}
		}
	}
	return { pageData };
};
