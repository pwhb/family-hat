import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { hash } from 'argon2';
import type {
	Abortable,
	Document,
	Filter,
	FindOneOptions,
	FindOptions,
	InsertOneOptions,
	OptionalId
} from 'mongodb';
import { encrypt } from './crypto';

export const Q = {
	findOne: async (
		collection: string,
		query: Filter<any>,
		options?: Omit<FindOneOptions, 'timeoutMode'> & Abortable
	) => {
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection(collection);
		return await col.findOne(query, options);
	},

	find: async (collection: string, query: Filter<any>, options?: FindOptions & Abortable) => {
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection(collection);
		return await col.find(query, options).toArray();
	},

	insertOne: async (collection: string, doc: OptionalId<Document>, options?: InsertOneOptions) => {
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection(collection);
		return await col.insertOne(doc, options);
	},

	getCollection: async (collection: string) => {
		const client = await clientPromise;
		return client.db(DB_NAME).collection(collection);
	}
};

interface IOptions {
	project?: any;
	isString?: any;
	isArray?: boolean;
	preserveArray?: boolean;
}

interface ILookUpSlice {
	from: string;
	localField: string;
	foreignField: string;
	as: string;
	opts?: IOptions;
}

export const createLookUpSlice = ({ from, localField, foreignField, as, opts }: ILookUpSlice) => {
	let conversionExpression: any;

	if (opts && opts.isArray) {
		conversionExpression = {
			$map: {
				input: `$${localField}`,
				as: 'idItem',
				in: opts.isString ? '$$idItem' : { $toObjectId: '$$idItem' }
			}
		};
	} else {
		conversionExpression =
			opts && opts.isString ? `$${localField}` : { $toObjectId: `$${localField}` };
	}

	const safeSearchId = {
		$cond: {
			if: {
				$and: [
					{ $not: [{ $not: [`$${localField}`] }] },
					{ $ne: [`$${localField}`, ''] },

					...(opts && opts.isArray ? [{ $ne: [`$${localField}`, []] }] : [])
				]
			},
			then: conversionExpression,
			else: '$$REMOVE'
		}
	};

	const matchCondition =
		opts && opts.isArray
			? { $in: [`$${foreignField}`, '$$searchId'] }
			: { $eq: [`$${foreignField}`, '$$searchId'] };

	const slice: Document[] = [
		{
			$lookup: {
				from,
				let: {
					searchId: safeSearchId
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [{ $ifNull: ['$$searchId', false] }, matchCondition]
							}
						}
					}
				],
				as
			}
		}
	];

	const shouldUnwind = !(opts && opts.isArray) || (opts && opts.isArray && !opts.preserveArray);

	if (shouldUnwind) {
		slice.push({
			$unwind: {
				path: `$${as}`,
				preserveNullAndEmptyArrays: true
			}
		});
	}

	if (opts && opts.project) {
		slice[0].$lookup.pipeline = [...slice[0].$lookup.pipeline, { $project: opts.project }];
	}

	return slice;
};

export const getPipeline = (colName: string, query: Filter<any>, page?: number, size?: number) => {
	const pipeline: Document[] = [
		{
			$match: query
		},
		{
			$project: {
				appID: 0,
				hashedPassword: 0
			}
		},
		{
			$sort: {
				_id: -1
			}
		}
	];

	if (colName === 'members') {
		const lookupSlice = createLookUpSlice({
			from: 'families',
			localField: 'familyID',
			foreignField: '_id',
			as: 'family'
		});
		const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
		if (matchIndex !== -1) {
			pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
		}
	} else if (colName === 'menus') {
		const lookupSlice = createLookUpSlice({
			from: 'menus',
			localField: 'parentID',
			foreignField: '_id',
			as: 'parent'
		});
		const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
		if (matchIndex !== -1) {
			pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
		}
	} else if (colName === 'relationships') {
		const lookupSlice = [
			...createLookUpSlice({
				from: 'members',
				localField: 'sourceID',
				foreignField: '_id',
				as: 'sourceMember'
			}),
			...createLookUpSlice({
				from: 'members',
				localField: 'targetID',
				foreignField: '_id',
				as: 'targetMember'
			}),
			...createLookUpSlice({
				from: 'relation_types',
				localField: 'relationTypeID',
				foreignField: '_id',
				as: 'relationType'
			})
		];
		const matchIndex = pipeline.findIndex((stage) => '$match' in stage);
		if (matchIndex !== -1) {
			pipeline.splice(matchIndex + 1, 0, ...lookupSlice);
		}
	}
	if (page && size) {
		pipeline.push(
			...[
				{
					$skip: (page - 1) * size
				},
				{
					$limit: size
				}
			]
		);
	}
	return pipeline;
};

/**
 * Converts flat dot-notation paths ({ "name.en": "a", "name.my": "b" })
 * into nested objects ({ name: { en: "a", my: "b" } }).
 */
export function unflatten<T extends Record<string, any> = Record<string, any>>(
	flatObj: Record<string, any>
): T {
	const result: Record<string, any> = {};

	for (const path in flatObj) {
		if (!Object.prototype.hasOwnProperty.call(flatObj, path)) continue;

		const value = flatObj[path];

		if (value === undefined) continue;

		if (!path.includes('.')) {
			result[path] = value;
			continue;
		}

		const keys = path.split('.');
		let current = result;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];

			if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
				current[key] = {};
			}

			current = current[key];
		}

		current[keys[keys.length - 1]] = value;
	}

	return result as T;
}

export const populatePayload = async (colName: string, body: any) => {
	if (colName === 'members') {
		body.code = body.name.en.replace(/\s/g, '_').toUpperCase();
	} else if (['user_roles'].includes(colName)) {
		body.code = body.name.replace(/\s/g, '_').toUpperCase();
	} else if (colName === 'questions') {
		if (body.options && body.options.length) {
			for (const idx in body.options) {
				body.options[idx].code = `${body.code}_${idx}`;
			}
		}
	} else if (colName === 'relation_types') {
		body.code = `${body.sourceLabel.en.replace(/\s/g, '_').toUpperCase()}_${body.targetLabel.en.replace(/\s/g, '_').toUpperCase()}`;
	} else if (colName === 'users') {
		body.hashedPassword = await hash(body.password);
		body.code = body.name.replace(/\s/g, '_').toUpperCase();
		if (!body.username) body.username = body.code.toLowerCase();
		delete body.password;
	} else if (colName === 'configs' && body.type && body.type === 'secured') {
		body.value = await encrypt(body.value);
	}
	return body;
};
