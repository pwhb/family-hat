
export const getToken = (request: Request) => {
	const auth = request.headers.get('authorization');
	if (!auth) {
		return null;
	}
	return auth.split(' ')[1];
};

