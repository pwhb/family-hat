import { get, type Writable } from 'svelte/store';

export const syncLocalStorage = (key: string, store: Writable<any>, value?: any) => {
	const v = localStorage.getItem(key);
	if (v && JSON.parse(v)) {
		store.set(JSON.parse(v));
	} else {
		localStorage.setItem(key, JSON.stringify(value || get(store)));
	}
};

export const updateLocalStorage = (key: string, store: Writable<any>, value: any) => {
	store.set(value);
	localStorage.setItem(key, JSON.stringify(value));
};

export const getToken = (request: Request) => {
	const auth = request.headers.get('authorization');
	if (!auth) {
		return null;
	}
	return auth.split(' ')[1];
};

