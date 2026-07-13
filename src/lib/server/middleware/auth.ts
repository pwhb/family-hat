import type { Handle } from '@sveltejs/kit';
import { ADMIN_TOKEN, getUserFromToken } from '../common';

export const authGuard: Handle = async ({ event, resolve }) => {
	if (event.locals.pageConfig && event.locals.pageConfig.isPublic) return resolve(event);
	console.log('WUTTYI', 'authGuard', event.locals.pageUrl, event.locals.pageConfig);
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
