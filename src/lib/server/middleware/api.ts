import { json, type Handle } from '@sveltejs/kit';
import { Q } from '../configs';
import { fillTemplate } from '$lib/client/common';
import { ObjectId } from 'mongodb';

export function parseQueryTemplate(
	template: string,
	source: Record<string, any>
): Record<string, any> {
	const interpolated = fillTemplate(template, source);
	return JSON.parse(interpolated, (key, value) => {
		if (typeof value === 'string') {
			const oidMatch = value.match(/^(?:ObjectId|\$oid)\(["']([a-fA-F0-9]{24})["']\)$/);
			if (oidMatch) {
				return new ObjectId(oidMatch[1]);
			}
		}
		return value;
	});
}
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
		try {
			const query = parseQueryTemplate(perm.customQuery, { ...locals.user.configs });
			console.log('query', perm.customQuery, locals.user.configs, query);
			locals.query = { ...locals.query, ...query };
		} catch (e) {}
	}
	// if (scopeMap['own']) {
	// 	const perm = scopeMap['group'];
	// 	try {
	// 		const query = { _id: { $in: [locals.user._id, ...locals.user.configs.ids] } }
	// 		locals.query = { ...locals.query, ...query };
	// 	} catch (e) { }
	// }
	return resolve(event);
};
