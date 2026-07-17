import type { Handle } from '@sveltejs/kit';
export const pageGuard: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
