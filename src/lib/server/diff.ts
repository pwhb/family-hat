/**
 * Recursively checks nested objects and returns a flat dot-notation diff
 * or nested object diff.
 */
export function getDocumentDiff(original: any, updatePayload: any, prefix = '') {
	let diff: Record<string, any> = {};
	const changes = updatePayload?.$set || updatePayload;

	for (const [key, newValue] of Object.entries(changes)) {
		const currentPath = prefix ? `${prefix}.${key}` : key;
		const oldValue = original?.[key];

		if (
			typeof oldValue !== typeof newValue ||
			oldValue === null ||
			newValue === null ||
			typeof newValue !== 'object' ||
			newValue instanceof Date ||
			Array.isArray(newValue)
		) {
			if (!isEqual(oldValue, newValue)) {
				diff[currentPath] = {
					from: oldValue ?? null,
					to: newValue
				};
			}
		} else {
			const nestedDiff = getDocumentDiff(oldValue, newValue, currentPath);
			diff = { ...diff, ...nestedDiff };
		}
	}

	return diff;
}

/**
 * Value comparison for primitives, dates, and arrays.
 */
function isEqual(val1: any, val2: any) {
	if (val1 === val2) return true;

	const d1 = val1 instanceof Date ? val1.getTime() : Date.parse(val1);
	const d2 = val2 instanceof Date ? val2.getTime() : Date.parse(val2);
	if (!isNaN(d1) && !isNaN(d2)) return d1 === d2;

	return JSON.stringify(val1) === JSON.stringify(val2);
}
