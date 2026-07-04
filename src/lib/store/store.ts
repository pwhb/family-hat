import { browser } from '$app/env';
import { writable } from 'svelte/store';

export function createLocalStorageStore<T>(key: string, defaultValue: T) {
	let initialValue = defaultValue;
	if (browser) {
		const stored = localStorage.getItem(key);
		if (stored) {
			try {
				initialValue = JSON.parse(stored);
			} catch {
				initialValue = stored as unknown as T; // Fallback for raw un-stringified strings
			}
		} else {
			localStorage.setItem(key, JSON.stringify(defaultValue));
		}
	}

	const store = writable<T>(initialValue);

	if (browser) {
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}
