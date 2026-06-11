import { ROOT_TOKEN } from '$env/static/private';
import { getToken } from '$lib/util/client';
export const checkAuth = (request: Request) => {
	const token = getToken(request);
	if (!token) {
		return false;
	}
	return ROOT_TOKEN === token;
};
