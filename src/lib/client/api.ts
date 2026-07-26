const ENDPOINTS = {
	UPLOAD: '/api/uploads'
};
export const api = {
	upload: async (file: Blob | File, path: string = 'assets') => {
		const res = await fetch(`${ENDPOINTS.UPLOAD}?path=${path}`, {
			headers: {
				'Content-Type': file.type
			}
		});
		const resJSON = await res.json();
		if (resJSON && resJSON.url) {
			const uploadRes = await fetch(resJSON.url, {
				method: 'PUT',
				headers: {
					'Content-Type': file.type
				},
				body: file
			});
			if (uploadRes.ok) {
				return resJSON;
			}
		}
	}
};
