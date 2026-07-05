import type { PageServerLoad } from './$types';
import clientPromise from '$lib/db';
import { DB_NAME } from '$env/static/private';
import { getConfig } from '$lib/util/configs';
import { ObjectId, type Document } from 'mongodb';
import { createLookUpSlice } from '$lib/util/server';
import { decrypt } from '$lib/util/crypto';

export const load: PageServerLoad = async ({ cookies, url, params }) => {
	const client = await clientPromise;
	const colName = params.slug.replaceAll('-', '_');
	const col = client.db(DB_NAME).collection(colName);
	const pipeline: Document[] = [
		{
			$match: {
				_id: new ObjectId(params.id)
			}
		},
		...createLookUpSlice({
			from: 'users',
			localField: 'createdBy',
			foreignField: '_id',
			as: 'createdByUser',
			opts: {
				project: { name: 1, username: 1 }
			}
		}),
		...createLookUpSlice({
			from: 'users',
			localField: 'updatedBy',
			foreignField: '_id',
			as: 'updatedByUser',
			opts: {
				project: { name: 1, username: 1 }
			}
		}),
		{
			$project: {
				appId: 0
			}
		},
		{
			$limit: 1
		}
	];

	const list = await col.aggregate(pipeline).toArray();
	const [_, admin, slug, action] = url.pathname.split('/');
	const key = `${admin}_${action}_${slug}`.replaceAll('-', '_').toUpperCase();
	const pageConfig = await getConfig(key);
	const data = list[0];
	if (colName === 'configs' && data.type === 'secured') {
		data.value = await decrypt(data.value);
	}
	return {
		key,
		pageData: {
			data
		},
		pageConfig
	};
};
