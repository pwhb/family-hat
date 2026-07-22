import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { mapDeep } from '$lib/server/common';
import { mappers, type MapperKey } from '$lib/server/mappers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const client = await clientPromise;
	const collection = client.db(DB_NAME).collection('members');
	let pageData = await collection
		.aggregate([
			{
				$match: {
					$and: [{ avatarUrl: { $exists: true } }, { avatarUrl: { $ne: '' } }]
				}
			},
			{
				$project: locals.pageConfig.privateConfigs.project ?? {
					caption: '$name',
					avatarUrl: 1,
					title: 1
				}
			},
			{ $sample: { size: locals.pageConfig.privateConfigs.sampleSize ?? 4 } }
		])
		.toArray();

	if (locals.pageConfig.privateConfigs && locals.pageConfig.privateConfigs.mapDeepConfigs) {
		for (const { paths, func, key } of locals.pageConfig.privateConfigs.mapDeepConfigs) {
			const mapper = mappers[func as MapperKey];
			if (mapper) {
				pageData = await mapDeep(pageData, paths, mapper, key);
			}
		}
	}
	return {
		pageData
	};
};
