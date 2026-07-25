import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { createLookUpSlice, mapDeep } from '$lib/server/common';
import { mappers, type MapperKey } from '$lib/server/mappers';

export const load: PageServerLoad = async ({ locals }) => {
	const client = await clientPromise;
	const { privateConfigs } = locals.pageConfig;
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
				$project: privateConfigs.query.relationships.project
			}
		])
		.toArray();
	let pageData = { families, relationships };
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
