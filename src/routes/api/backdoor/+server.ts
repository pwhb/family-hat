import { DB_NAME } from '$env/static/private';
import clientPromise from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import { hash } from 'argon2';

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const body = await request.json();
		const client = await clientPromise;
		const col = client.db(DB_NAME).collection('users');
		const users = await col
			.find(
				{},
				{
					projection: {
						username: 1
					}
				}
			)
			.toArray();

		for (let user of users) {
			user.password = crypto.randomUUID().split('-').join('');
			await col.findOneAndUpdate(
				{ _id: user._id },
				{
					$set: {
						hashedPassword: await hash(user.password)
					}
				}
			);
		}
		return json({ message: 'success', users });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
