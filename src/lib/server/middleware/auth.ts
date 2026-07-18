import { redirect, type Handle } from '@sveltejs/kit';
import { getUserFromToken } from '../common';
import { ADMIN_TOKEN, SERVER_ENDPOINTS } from '$lib/consts';
import { Q } from '../configs';
import { ObjectId } from 'mongodb';

export const authGuard: Handle = async ({ event, resolve }) => {
	const { cookies, locals, url } = event;
	if (locals.isPublic || ['error'].includes(locals.identifier)) return resolve(event);
	const token = cookies.get(ADMIN_TOKEN);
	if (token) {
		locals.user = await getUserFromToken(token);
		if (!locals.user) {
			cookies.delete(ADMIN_TOKEN, {
				path: '/'
			});
		}
		if (locals.user.roles) {
			const roles = locals.user.roles;
			locals.rbac = {
				roles: roles.map((r: any) => r.name),
				permissions: [...new Set(roles.flatMap((r: any) => r.permissions || []))],
				menus: [...new Set(roles.flatMap((r: any) => r.menus || []))],
				pages: [...new Set(roles.flatMap((r: any) => r.pages || []))]
			};

			if (locals.identifier !== 'api' && !locals.rbac.pages.includes(locals.pageId)) {
				throw redirect(
					307,
					`${SERVER_ENDPOINTS.FORBIDDEN_ERROR}?from=${encodeURIComponent(`${url.pathname}${url.search}`)}`
				);
			}

			if (locals.rbac.menus) {
				locals.menus = await Q.find(
					'menus',
					{ _id: { $in: locals.rbac.menus.map((v: string) => new ObjectId(v)) }, isActive: true },
					{
						projection: {
							name: 1,
							parent: '$parentID',
							url: 1
						}
					}
				);
			}
			delete locals.user.roles;
		}
	}
	return resolve(event);
};
