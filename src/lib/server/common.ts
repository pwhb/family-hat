import { DB_NAME, MODE, ROOT_TOKEN, SECRET_KEY } from '$env/static/private';
import { ADMIN_TOKEN, SERVER_ENDPOINTS } from '$lib/consts';
import clientPromise from '$lib/db';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Document } from 'mongodb';

export const SKIP_REDIRECT_ROUTES = [
	SERVER_ENDPOINTS.LOGIN,
	SERVER_ENDPOINTS.MISSING_CONFIG_ERROR,
	SERVER_ENDPOINTS.FORBIDDEN_ERROR
];

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getCleanPath(
	pathname: string,
	routeId: string | null,
	preserve = ['slug']
): string {
	if (!routeId) return pathname;

	const preserveSet = new Set(preserve);
	const pathSegments = pathname.split('/').filter(Boolean);

	const routeSegments = routeId.split('/').filter((s) => s && !s.startsWith('('));

	return (
		'/' +
		pathSegments
			.map((segment, i) => {
				const routeSegment = routeSegments[i];
				if (routeSegment?.startsWith('[') && routeSegment.endsWith(']')) {
					const paramName = routeSegment.slice(1, -1);
					return preserveSet.has(paramName) ? segment : `{${paramName}}`;
				}
				return segment;
			})
			.join('/')
	);
}

export const getToken = (request: Request, header = 'authorization') => {
	const auth = request.headers.get(header);
	if (!auth) {
		return null;
	}
	return auth.split(' ')[1];
};

export const checkAuth = async (request: Request, cookies: Cookies) => {
	let token = cookies.get(ADMIN_TOKEN);
	if (!token && MODE === 'dev') {
		token = getToken(request) as string;
	}
	if (!token) return;
	return await getUserFromToken(token);
};

export const getUserFromToken = async (token: string) => {
	const payload: any = jwt.verify(token, SECRET_KEY);
	const client = await clientPromise;
	const userRes = await client
		.db(DB_NAME)
		.collection('users')
		.aggregate([
			{
				$match: { username: payload.username, isActive: true }
			},
			...createLookUpSlice({
				from: 'user_roles',
				localField: 'roles',
				foreignField: '_id',
				as: 'roles',
				opts: {
					isArray: true,
					preserveArray: true,
					project: {
						name: 1,
						pages: 1,
						menus: 1,
						permissions: 1
					}
				}
			})
		])
		.toArray();
	if (!userRes || !userRes[0]) return;
	const user = userRes[0];
	delete user.hashedPassword;
	return user;
};

export const checkBasicAuth = (request: Request) => {
	const token = getToken(request, 'x-api-token');
	if (!token) {
		return false;
	}
	return ROOT_TOKEN === token;
};

export function serializeDoc<T extends { _id: any }>(doc: T) {
	return {
		...doc,
		_id: doc._id.toString()
	};
}

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
