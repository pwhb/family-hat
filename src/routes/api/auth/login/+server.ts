import { DB_NAME, SECRET_KEY } from '$env/static/private';
import { getConfig } from '$lib/server/configs';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { verify } from 'argon2';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { username, password } = await request.json();
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection('users');
		const user = await col.findOne({ username: username, isActive: true });
		if (!user) {
			return json({ message: 'Invalid Credentials' }, { status: 400 });
		}
		const matched = await verify(user.hashedPassword, password);
		if (!matched) {
			return json({ message: 'Invalid Credentials' }, { status: 400 });
		}
		const authConf = await getConfig('AUTH');
		const token = jwt.sign({ username: user.username }, SECRET_KEY, {
			expiresIn: authConf.jwtExpiresIn
		});
		return json({ token, expiresIn: authConf.jwtExpiresIn, maxAge: authConf.cookieMaxAge });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
