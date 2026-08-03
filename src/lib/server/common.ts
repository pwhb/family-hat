import { DB_NAME, ROOT_TOKEN, SECRET_KEY } from '$env/static/private';
import { SERVER_ENDPOINTS } from '$lib/consts';
import clientPromise from '$lib/db';
import jwt from 'jsonwebtoken';
import { createLookUpSlice } from './db';

export const SKIP_REDIRECT_ROUTES = [
	SERVER_ENDPOINTS.LOGIN,
	SERVER_ENDPOINTS.MISSING_CONFIG_ERROR,
	SERVER_ENDPOINTS.FORBIDDEN_ERROR
];

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getCleanPath(
	pathname: string,
	routeId: string | null,
	preserve = ['slug', 'title', 'name']
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

export type AsyncMapper<T = any, R = any> = (value: T, key: string) => Promise<R> | R;

/**
 * Traverses a target structure using dot-notation path segments and applies
 * a mapping function to the target leaf nodes (or creates a new sibling node).
 */
async function processPath(
	data: any,
	pathParts: string[],
	mapper: AsyncMapper,
	destinationKey?: string
): Promise<any> {
	if (data === null || data === undefined) return data;
	if (pathParts.length === 0) {
		return await mapper(data, '');
	}
	const [currentKey, ...remainingParts] = pathParts;
	if (Array.isArray(data)) {
		return await Promise.all(
			data.map((item) => processPath(item, pathParts, mapper, destinationKey))
		);
	}

	if (typeof data === 'object' && currentKey in data) {
		if (remainingParts.length === 0) {
			const sourceValue = data[currentKey];
			const targetKey = destinationKey || currentKey;

			const mappedValue = await mapper(sourceValue, currentKey);

			return {
				...data,
				[targetKey]: mappedValue
			};
		}

		return {
			...data,
			[currentKey]: await processPath(data[currentKey], remainingParts, mapper, destinationKey)
		};
	}

	return data;
}

/**
 * Executes a mapping function across one or more dot-notation path patterns.
 *
 * @param target The root object or array to transform
 * @param paths Single string path or array of paths
 * @param mapper Callback function applied to values matching the target paths
 * @param destinationKey Optional target key name to write the result to.
 */
export async function mapDeep<T = any>(
	target: T,
	paths: string | string[],
	mapper: AsyncMapper,
	destinationKey?: string
): Promise<T> {
	const pathList = Array.isArray(paths) ? paths : [paths];
	let result = target;

	for (const pathStr of pathList) {
		const pathParts = pathStr.split('.');
		result = await processPath(result, pathParts, mapper, destinationKey);
	}

	return result;
}
