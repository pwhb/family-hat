import { DB_NAME, SECRET_KEY } from '$env/static/private';
import clientPromise from '$lib/db';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ADMIN_TOKEN, SERVER_ENDPOINTS } from '$lib/consts';

export const load: PageServerLoad = async ({ locals }) => {
	const client = await clientPromise;
	const list = locals.pageConfig.load;
	const pageData: any = {};
	const promises = list.map(async (v: any) => {
		const collection = client.db(DB_NAME).collection(v.collection);
		if (v.type === 'total_count') {
			const [total, count] = await Promise.all([
				collection.countDocuments({ ...v.query }),
				collection.countDocuments({ ...v.query, isActive: true })
			]);
			pageData[v.key] = { total, count };
		}
	});
	await Promise.all(promises);
	return {
		pageData
	};
};

export const actions: Actions = {
	login: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');
		const res = await fetch(SERVER_ENDPOINTS.LOGIN_API, {
			method: 'POST',
			body: JSON.stringify({ username, password })
		});
		const resJSON = await res.json();
		if (!res.ok) return fail(res.status, resJSON);
		const { token, maxAge } = resJSON;
		cookies.set(ADMIN_TOKEN, token, {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge: maxAge
		});
		return redirect(301, '/admin');
	},
	logout: async ({ cookies }) => {
		cookies.delete(ADMIN_TOKEN, {
			path: '/'
		});
		return redirect(301, SERVER_ENDPOINTS.LOGIN);
	},
	changePassword: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const newPassword = data.get('newPassword');
		const password = data.get('password');
		const res = await fetch(SERVER_ENDPOINTS.CHANGE_PASSWORD_API, {
			method: 'POST',
			body: JSON.stringify({ newPassword, password })
		});
		const resJSON = await res.json();
		return res.ok ? resJSON : fail(res.status, resJSON);
	}
};
