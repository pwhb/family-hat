import { buildMappedData, invertMapping } from '$lib/client/common';
import { COL_LIST } from '$lib/consts';
import { populatePayload, Q, unflatten } from '$lib/server/db';
import { getDocumentDiff } from '$lib/server/diff';
import { getObject } from '$lib/server/s3';
import { json, type RequestHandler } from '@sveltejs/kit';
import { parse } from 'csv/sync';
import { ObjectId, type Document } from 'mongodb';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		if (!params.slug) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const colName = params.slug.replaceAll('-', '_');
		if (!COL_LIST.includes(colName)) {
			return json({ message: 'Not Found' }, { status: 404 });
		}
		const { _id, url, action } = await request.json();
		if (action === 'import') {
			const object = await getObject({ key: url });
			if (!object.Body) {
				throw new Error('S3 object body is empty');
			}
			const csvString = await object.Body.transformToString('utf-8');
			const jsonRecords = parse(csvString, {
				columns: true,
				skip_empty_lines: true,
				trim: true
			});

			const { mapping } = locals.apiConfig;
			const mapped = buildMappedData(jsonRecords, invertMapping(mapping));
			const created = await Q.insertOne('imports', {
				url,
				collection: colName,
				status: 'pending',
				json: mapped,
				count: mapped.length,
				appId: locals.user.appId,
				createdBy: locals.user._id,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			const data = await Q.findOne('imports', { _id: created.insertedId });
			return json({ data });
		} else if (action === 'commit') {
			const doc = await Q.findOne('imports', { _id: new ObjectId(_id) });
			if (!doc) {
				return json({ message: 'Not found' }, { status: 404 });
			}

			const list = await Promise.all(
				doc.json.map(async (v: Document) => {
					const id = v._id && ObjectId.isValid(v._id) ? new ObjectId(v._id) : v._id;
					const { _id, ...cleanData } = v;
					if (_id) {
						return {
							...cleanData,
							_id: id,
							updatedAt: new Date(),
							updatedBy: locals.user._id
						};
					} else {
						const populated = await populatePayload(colName, unflatten(cleanData));
						return {
							...populated,
							_id: new ObjectId(),
							isActive: !!v.isActive,
							appId: locals.user.appId,
							createdBy: locals.user._id,
							createdAt: new Date(),
							updatedAt: new Date()
						};
					}
				})
			);

			const collection = await Q.getCollection(colName);
			const originals = await collection
				.find({
					_id: {
						$in: list.map((v: any) => v._id)
					}
				})
				.toArray();
			const originalMap: Record<string, any> = {};
			originals.forEach((v: any) => {
				originalMap[v._id.toString()] = v;
			});

			const logs = list.map((v: Document) => {
				const original = v._id ? originalMap[v._id.toString()] : null;
				return original
					? {
							refId: v._id,
							original: original,
							update: v,
							diff: getDocumentDiff(original, v),
							action: 'batch_update',
							batchId: doc._id,
							appId: locals.user.appId,
							createdAt: new Date(),
							createdBy: locals.user._id
						}
					: {
							refId: null,
							update: v,
							action: 'batch_create',
							batchId: doc._id,
							appId: locals.user.appId,
							createdAt: new Date(),
							createdBy: locals.user._id
						};
			});
			const operations = list.map((v: Document) => {
				const { _id, ...update } = v;
				const id = _id && ObjectId.isValid(_id) ? new ObjectId(_id) : _id;
				return {
					updateOne: {
						filter: { _id: id },
						update: {
							$set: {
								...update
							}
						},
						upsert: true
					}
				};
			});
			const data = await collection.bulkWrite(operations);
			const historyCol = await Q.getCollection(`history_${colName}`);
			await historyCol.insertMany(logs);
			return json({ data });
		}
		return json({ message: 'Action not allowed.' }, { status: 400 });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
