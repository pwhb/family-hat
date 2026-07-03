import { DB_NAME, ROOT_TOKEN, SECRET_KEY } from '$env/static/private';
import clientPromise from '$lib/db';
import { getToken } from '$lib/util/client';
import jwt from "jsonwebtoken"
export const checkAuth = async (request: Request) => {
	const token = getToken(request);
	if (!token) return
	return await getUserFromToken(token)
};

export const getUserFromToken = async (token: string) => {
	const payload: any = jwt.verify(token, SECRET_KEY)
	const client = await clientPromise
	const user = await client.db(DB_NAME).collection("users").findOne({ username: payload.username, isActive: true })
	if (!user) return
	delete user.hashedPassword
	return user
}

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
