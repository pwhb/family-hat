import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { ObjectId } from 'mongodb';
import { createLookUpSlice, mapDeep } from '$lib/server/common';
import { mappers, type MapperKey } from '$lib/server/mappers';

export const load: PageServerLoad = async ({ params, locals }) => {
	const client = await clientPromise;
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
				$project: {
					code: 1,
					sourceID: 1,
					targetID: 1,
					name: '$relationType.name',
					sourceGender: '$relationType.sourceGender',
					sourceLabel: '$relationType.sourceLabel',
					sourceEnd: '$relationType.sourceEnd',
					targetGender: '$relationType.targetGender',
					targetLabel: '$relationType.targetLabel',
					targetEnd: '$relationType.targetEnd',
					category: '$relationType.category'
				}
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
							name: '$name',
							aliases: '$aliases',
							code: '$code',
							archetype: '$archetype',
							level: '$level',
							order: '$order',
							related: '$related',
							avatarUrl: '$avatarUrl',
							gender: '$gender'
						}
					}
				}
			},

			...createLookUpSlice({
				from: 'families',
				localField: '_id',
				foreignField: '_id',
				as: 'family'
			}),
			{
				$project: {
					members: 1,
					'family.name': 1,
					'family.code': 1,
					'family.fullName': 1,
					'family.center': 1,
					'family.customCss': 1
				}
			}
		])
		.toArray();
	const member = families[0].members.find((v: any) => v._id === params.id);

	let pageData = { families, relationships, member };
	if (locals.pageConfig.privateConfigs && locals.pageConfig.privateConfigs.mapDeepConfigs) {
		for (const { paths, func, key } of locals.pageConfig.privateConfigs.mapDeepConfigs) {
			const mapper = mappers[func as MapperKey];
			if (mapper) {
				pageData = await mapDeep(pageData, paths, mapper, key);
			}
		}
	}
	return { pageData };
};
