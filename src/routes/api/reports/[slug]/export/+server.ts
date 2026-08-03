import { COL_LIST } from '$lib/consts';
import { getPipeline, Q } from '$lib/server/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import type { Filter } from 'mongodb';
import { buildMappedData } from '$lib/client/common';
import { getPresignedUrl, putObject } from '$lib/server/s3';
import { generateReportFile } from '$lib/server/reports';

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
			appID: locals.user.appID
		};
		const count = await col.countDocuments(query);
		const pipeline = getPipeline(colName, query);
		const data = await col.aggregate(pipeline).toArray();
		const { mapping } = locals.apiConfig;
		const mapped = buildMappedData(data, mapping);
		const { format } = await request.json();
		const { buffer, contentType, extension } = await generateReportFile(mapped, format);
		const fileName = `${colName}-${Date.now()}.${extension}`;
		const key = `reports/${colName}/${fileName}`;

		const putObjectRes = await putObject({
			key,
			body: buffer,
			contentType
		});

		if (putObjectRes.$metadata.httpStatusCode !== 200) {
			throw new Error('Upload failed.');
		}

		await Q.insertOne('exports', {
			collection: colName,
			url: key,
			fileName,
			query,
			format,
			createdAt: new Date(),
			createdBy: locals.user._id
		});

		const url = await getPresignedUrl({ key });
		return json({ url });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
