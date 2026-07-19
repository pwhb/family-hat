import { DB_NAME, SECRET_KEY } from '$env/static/private';
import clientPromise from '$lib/db';
import { compare } from 'bcrypt';
import { getConfig } from '$lib/server/configs';
import jwt from 'jsonwebtoken';
import { redirect } from '@sveltejs/kit';
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
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const username = data.get('username');
		const password = data.get('password');

		const client = await clientPromise;
		const col = client.db(DB_NAME).collection('users');
		const user = await col.findOne({ username: username, isActive: true });
		if (!user) {
			throw redirect(303, SERVER_ENDPOINTS.LOGIN);
		}
		const matched = await compare(password as string, user.hashedPassword);
		if (!matched) {
			throw redirect(303, SERVER_ENDPOINTS.LOGIN);
		}
		const authConf = await getConfig('AUTH');
		const token = jwt.sign({ username: user.username }, SECRET_KEY, {
			expiresIn: authConf.jwtExpiresIn
		});

		cookies.set(ADMIN_TOKEN, token, {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge: authConf.cookieMaxAge
		});
		return redirect(301, '/admin');
	},
	logout: async ({ cookies }) => {
		cookies.delete(ADMIN_TOKEN, {
			path: '/'
		});
		return redirect(301, SERVER_ENDPOINTS.LOGIN);
	}
};
