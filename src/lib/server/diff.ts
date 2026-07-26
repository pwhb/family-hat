import { getDeepValue } from '$lib/client/common';

/**
 * Normalizes values for fast string comparison.
 */
function isSameValue(val1: any, val2: any): boolean {
	if (val1 === val2) return true;

	if (val1 == null && val2 == null) return true;

	if (val1 instanceof Date && val2 instanceof Date) {
		return val1.getTime() === val2.getTime();
	}

	if (typeof val1 === 'object' && typeof val2 === 'object') {
		return JSON.stringify(val1) === JSON.stringify(val2);
	}
	return false;
}

/**
 * Calculates field-level diffs between a target document and an update payload.
 * Supports both dot-notation paths ("name.en") and nested objects ({ name: { en: "..." } }).
 */
export function getDocumentDiff(
	original: Record<string, any> | null | undefined,
	updatePayload: Record<string, any>
): Record<string, any> {
	const diff: Record<string, any> = {};
	const changes = updatePayload?.$set || updatePayload;

	if (!changes || typeof changes !== 'object') return diff;

	// Ensure 'original' is treated as an empty object if null or undefined
	const sourceObj = original || {};

	for (const [path, newValue] of Object.entries(changes)) {
		const oldValue = getDeepValue(path, sourceObj);

		if (!isSameValue(oldValue, newValue)) {
			diff[path] = {
				from: oldValue ?? null,
				to: newValue
			};
		}
	}

	return diff;
}
