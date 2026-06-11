import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('members');
	const data = await col
		.aggregate([
			{
				$match: { isActive: true }
			},
			{
				$group: {
					_id: '$familyID',
					members: {
						$push: {
							name: '$name',
							title: '$title',
							code: '$code',
							archetype: '$archetype',
							level: '$level',
							order: '$order'
						}
					}
				}
			},
			{
				$addFields: {
					familyID: {
						$toObjectId: '$_id'
					}
				}
			},
			{
				$lookup: {
					from: 'families',
					localField: 'familyID',
					foreignField: '_id',
					as: 'family'
				}
			},
			{
				$unwind: '$family'
			},
			{
				$project: {
					members: 1,
					'family.name': 1,
					'family.code': 1,
					'family.fullName': 1,
					'family.center': 1,
					'family.bgColor': 1
				}
			}
		])
		.toArray();

	return { data };
};
