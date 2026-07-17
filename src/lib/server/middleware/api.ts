import type { Handle } from '@sveltejs/kit';
export const apiGuard: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
