import type { Handle } from '@sveltejs/kit';
import { ADMIN_TOKEN, getUserFromToken } from '../common';

export const authGuard: Handle = async ({ event, resolve }) => {
	if (event.locals.isPublic) return resolve(event);
	const { cookies, locals } = event;
	const token = cookies.get(ADMIN_TOKEN);
	if (token) {
		locals.user = await getUserFromToken(token);
		if (!locals.user) {
			cookies.delete(ADMIN_TOKEN, {
				path: '/'
			});
		}
	}
	return resolve(event);
};
