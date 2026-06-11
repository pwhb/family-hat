import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
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
							title: '$title',
							code: '$code',
							archetype: '$archetype',
							level: '$level',
							order: '$order',
							related: '$related'
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
					fromID: { $in: memberIDs }
				}
			},
			{
				$addFields: {
					relationTypeID: { $toObjectId: '$relationTypeID' }
				}
			},
			{
				$lookup: {
					from: 'relation_types',
					localField: 'relationTypeID',
					foreignField: '_id',
					as: 'relationType'
				}
			},
			{
				$unwind: '$relationType'
			},
			{
				$project: {
					code: 1,
					fromID: 1,
					toID: 1,
					fromGender: '$relationType.fromGender',
					fromLabel: '$relationType.fromLabel',
					fromEnd: '$relationType.fromEnd',
					toGender: '$relationType.toGender',
					toLabel: '$relationType.toLabel',
					toEnd: '$relationType.toEnd'
				}
			}
		])
		.toArray();

	return { families, relationships };
};
