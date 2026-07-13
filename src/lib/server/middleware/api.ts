import type { Handle } from '@sveltejs/kit';
import { ADMIN_TOKEN, getUserFromToken } from '../common';

export const apiGuard: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
