import { DB_NAME, MODE, ROOT_TOKEN, SECRET_KEY } from '$env/static/private';
import clientPromise from '$lib/db';
import type { Cookies } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { Document } from 'mongodb';

export const colList = [
	'configs',
	'families',
	'logs',
	'members',
	'users',
	'questions',
	'relationships',
	'relation_types'
];

export const getToken = (request: Request, header = 'authorization') => {
	const auth = request.headers.get(header);
	if (!auth) {
		return null;
	}
	return auth.split(' ')[1];
};

export const checkAuth = async (request: Request, cookies: Cookies) => {
	let token = cookies.get('admin_token');
	if (!token && MODE === 'dev') {
		token = getToken(request) as string;
	}
	if (!token) return;
	return await getUserFromToken(token);
};

export const getUserFromToken = async (token: string) => {
	const payload: any = jwt.verify(token, SECRET_KEY);
	const client = await clientPromise;
	const user = await client
		.db(DB_NAME)
		.collection('users')
		.findOne({ username: payload.username, isActive: true });
	if (!user) return;
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

export const createLookUpSlice = ({
	from,
	localField,
	foreignField,
	as,
	opts
}: {
	from: string;
	localField: string;
	foreignField: string;
	as: string;
	opts?: any;
}) => {
	const slice: Document[] = [
		{
			$lookup: {
				from,
				let: {
					searchId: opts && opts.isString ? `$${localField}` : { $toObjectId: `$${localField}` }
				},
				pipeline: [{ $match: { $expr: { $eq: [`$${foreignField}`, '$$searchId'] } } }],
				as
			}
		},
		{
			$unwind: {
				path: `$${as}`,
				preserveNullAndEmptyArrays: true
			}
		}
	];
	if (opts && opts.project) {
		slice[0].$lookup.pipeline = [...slice[0].$lookup.pipeline, { $project: opts.project }];
	}
	return slice;
};
