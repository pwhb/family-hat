import { COL_LIST } from '$lib/consts';
import { getPipeline, Q } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { Filter } from 'mongodb';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}

		const colName = params.slug.replaceAll('-', '_');
		if (!COL_LIST.includes(colName)) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const col = await Q.getCollection(colName);
		const query: Filter<any> = {
			...locals.query,
			appId: locals.user.appId
		};
		const count = await col.countDocuments(query);
		const pipeline = getPipeline(colName, query);
		const data = await col.aggregate(pipeline).toArray();
		console.log(data);
		const { fieldBuilder } = locals.apiConfig;

		return json({ action: 'export', data, count, params });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
