import { json, type Handle } from '@sveltejs/kit';
import { Q } from '../configs';
import { fillTemplate } from '$lib/client/common';
export const apiGuard: Handle = async ({ event, resolve }) => {
	const { locals, request } = event;
	if (locals.identifier !== 'api') return resolve(event);
	const permissions = await Q.find('permissions', { url: locals.pageUrl, method: request.method });
	if (!locals.rbac) return json({ message: 'Forbidden' }, { status: 403 });
	const matched = permissions.filter((p) => locals.rbac.permissions.includes(p._id.toString()));
	if (!matched.length) {
		return json({ message: 'Forbidden' }, { status: 403 });
	}
	const scopeMap: any = {};
	matched.forEach((v) => {
		scopeMap[v.scope] = v;
	});
	locals.query = {};
	if (scopeMap['all']) return resolve(event);
	if (scopeMap['group']) {
		const perm = scopeMap['group'];
		console.log(perm);
		console.log();
		try {
			const query = JSON.parse(fillTemplate(perm.customQuery, { ...locals.user.configs }));
			locals.query = { ...locals.query, ...query };
		} catch (e) {}
	}
	return resolve(event);
};
