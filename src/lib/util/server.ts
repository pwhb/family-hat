import { ROOT_TOKEN } from '$env/static/private';
import { getToken } from '$lib/util/client';
export const checkAuth = (request: Request) => {
	const token = getToken(request);
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
