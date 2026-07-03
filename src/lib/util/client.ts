
export const getToken = (request: Request, header = 'authorization') => {
	const auth = request.headers.get(header);
	if (!auth) {
		return null;
	}
	return auth.split(' ')[1];
};

