import { ENTITY_NAME_MAP } from '$lib/consts';
import { format } from 'date-fns';

export interface LocalizedText {
	en: string;
	my: string;
	[locale: string]: string;
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const formatDateTime = (str: string) => format(str, 'MMM d, yyyy HH:mm');

export const getEntityName = (slug: string) => ENTITY_NAME_MAP[slug.replaceAll('-', '_')];
export function fillTemplate(template: string, source: Record<string, any>): string {
	if (!template || !source) return template;
	return template.replace(/\{\{(.*?)\}\}/g, (match, path) => {
		const cleanPath = path.trim();
		const value = cleanPath.split('.').reduce((current: any, key: string) => {
			if (current === null || current === undefined) return undefined;
			return current[key];
		}, source);
		return value !== undefined ? String(value) : match;
	});
}

interface GetOptionsArgs {
	type: 'constant' | 'fetch';
	url?: string;
	method?: string;
	headers?: Record<string, string>;
	values?: any[];
	mapping?: Record<string, string>;
}

export const getOptions = async ({
	type,
	url,
	method = 'GET',
	headers,
	values = [],
	mapping = {}
}: GetOptionsArgs): Promise<any[]> => {
	if (type === 'constant') return values;
	if (type === 'fetch') {
		if (!url) throw new Error('URL is required for type "fetch"');
		try {
			const res = await fetch(url, { method, headers });
			if (!res.ok) {
				console.error(`Fetch failed with status: ${res.status}`);
				return [];
			}
			const { data } = await res.json();
			if (!Array.isArray(data)) return [];

			return data.map((item) =>
				Object.fromEntries(
					Object.entries(mapping).map(([targetKey, sourcePath]) => [
						targetKey,
						getDeepValue(item, sourcePath)
					])
				)
			);
		} catch (err) {
			console.error('Failed to resolve dynamic options:', err);
			return [];
		}
	}
	return [];
};

export function getDeepValue(source: any, path: string) {
	return path.split('.').reduce((curr, key) => curr && curr[key], source);
}

export function buildEditableObj(fields: any[], dataSource: any) {
	const obj: Record<string, any> = {};
	if (!fields || !fields.length) return {};

	for (const field of fields) {
		const rawValue = getDeepValue(dataSource, field.key);
		const fallbackValue = field.datatype === 'array' ? [] : '';
		if (field.lang && field.lang.length) {
			obj[field.key] = {};
			for (const lang of field.lang) {
				obj[field.key][lang] =
					rawValue && rawValue[lang] !== undefined ? rawValue[lang] : fallbackValue;
			}
		} else {
			if (field.datatype === 'array') {
				if (Array.isArray(rawValue)) {
					obj[field.key] = rawValue;
				} else if (typeof rawValue === 'string' && rawValue === '') {
					obj[field.key] = [];
				} else {
					obj[field.key] = fallbackValue;
				}
			} else {
				obj[field.key] = rawValue !== undefined ? rawValue : fallbackValue;
			}
		}
	}
	return obj;
}
