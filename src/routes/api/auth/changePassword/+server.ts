import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';

import { hash, verify } from 'argon2';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { newPassword, password } = await request.json();
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection('users');
		const user = await col.findOne({ _id: locals.user._id });
		if (!user) {
			return json({ message: 'Invalid Credentials' }, { status: 400 });
		}
		const matched = await verify(user.hashedPassword, password);
		if (!matched) {
			return json({ message: "Invalid Credentials", }, { status: 400 })
		}
		await col.findOneAndUpdate(
			{ _id: locals.user._id },
			{
				$set: {
					hashedPassword: await hash(newPassword)
				}
			}
		);
		return json({ message: 'Password changed successfully.' });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
