import { json, type Handle } from '@sveltejs/kit';
import { Q } from '../configs';
import { fillTemplate } from '$lib/client/common';
import { ObjectId } from 'mongodb';
import { AUTH_STRATEGY } from '$lib/consts';
const OID_REGEX = /^(?:ObjectId|\$oid)\(["']?([a-fA-F0-9]{24})["']?\)$/i;

function parseQueryTemplate(template: string, source: Record<string, any>): Record<string, any> {
	const interpolated = fillTemplate(template, source);
	return JSON.parse(interpolated, (key, value) => {
		if (typeof value === 'string') {
			if (value.includes(',')) {
				const parts = value.split(',');
				const list: any[] = [];

				for (const part of parts) {
					const match = part.trim().match(OID_REGEX);
					list.push(match && match[1] ? new ObjectId(match[1]) : part);
				}
				return { $in: list };
			}
			const oidMatch = value.match(OID_REGEX);
			if (oidMatch) {
				return new ObjectId(oidMatch[1]);
			}
		}
		return value;
	});
}

function isIdAllowed(queryId: any, targetId: string): boolean {
	if (queryId.$in && Array.isArray(queryId.$in)) {
		return queryId.$in.some((id: any) => id.toString() === targetId);
	}
	return queryId.toString() === targetId;
}

export const apiGuard: Handle = async ({ event, resolve }) => {
	const { locals, request } = event;
	if (locals.identifier !== 'api') return resolve(event);
	const permissions = await Q.find(
		'permissions',
		{ url: locals.pageUrl, method: request.method },
		{
			sort: {
				priorty: -1
			}
		}
	);

	if (permissions.some((v) => v.authStrategy === AUTH_STRATEGY.BASIC)) return resolve(event);

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
			locals.query = { ...locals.query, ...query };
		} catch (e) {
			return json({ message: 'Invalid Config' }, { status: 500 });
		}
	}
	if (locals.query._id && event.params.id) {
		if (!isIdAllowed(locals.query._id, event.params.id))
			return json({ message: 'Forbidden' }, { status: 403 });
	}
	return resolve(event);
};
