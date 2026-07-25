import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, params }) => {
	try {
		return json({ params, action: 'import' });
	} catch (error) {
		return json({ message: 'Internal Server Error', log: error }, { status: 500 });
	}
};
