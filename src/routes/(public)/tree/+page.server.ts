import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { createLookUpSlice, mapDeep } from '$lib/server/common';
import { mappers, type MapperKey } from '$lib/server/mappers';

export const load: PageServerLoad = async ({ locals }) => {
	const client = await clientPromise;
	const membersCol = client.db(DB_NAME).collection('members');
	const families = await membersCol
		.aggregate([
			{
				$match: { isActive: true }
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
					'family._id': 1,
					'family.name': 1,
					'family.code': 1,
					'family.fullName': 1,
					'family.center': 1,
					'family.customCss': 1
				}
			}
		])
		.toArray();
	const memberIDs: string[] = [];
	families.forEach((family) => {
		family.members.forEach((member: any) => {
			if (!memberIDs.includes(member._id)) {
				memberIDs.push(member._id);
			}
		});
	});
	const relationshipsCol = client.db(DB_NAME).collection('relationships');
	const relationships = await relationshipsCol
		.aggregate([
			{
				$match: {
					sourceID: { $in: memberIDs }
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
					customSourceLabel: 1,
					customTargetLabel: 1,
					customName: 1,
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
	let pageData = { families, relationships };
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
