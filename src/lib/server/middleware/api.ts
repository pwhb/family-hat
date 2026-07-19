import { json, type Handle } from '@sveltejs/kit';
import { Q } from '../configs';
const scopePriorty = ['all'];
export const apiGuard: Handle = async ({ event, resolve }) => {
	const { locals, request } = event;
	if (locals.identifier !== 'api') return resolve(event);
	const permissions = await Q.find('permissions', { url: locals.pageUrl, method: request.method });
	if (!locals.rbac) return json({ message: 'Forbidden' }, { status: 403 });
	const matched = permissions.filter((p) => locals.rbac.permissions.includes(p._id.toString()));
	if (!matched.length) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}
	return resolve(event);
};
