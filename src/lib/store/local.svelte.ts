import { browser } from '$app/env';

export class LocalStorageState<T> {
	#key: string;
	// Defining internal state as a hidden rune
	#value = $state() as T;

	constructor(key: string, defaultValue: T) {
		this.#key = key;
		let initial = defaultValue;

		if (browser) {
			const stored = localStorage.getItem(key);
			if (stored) {
				try {
					initial = JSON.parse(stored);
				} catch {
					initial = stored as unknown as T;
				}
			} else {
				localStorage.setItem(key, JSON.stringify(defaultValue));
			}
		}

		this.#value = initial;

		// Auto-save whenever this specific piece of state changes anywhere in the app
		if (browser) {
			$effect.root(() => {
				$effect(() => {
					localStorage.setItem(this.#key, JSON.stringify(this.#value));
				});
			});
		}
	}

	// Standard JavaScript getter/setter intercepts reactive modifications seamlessly
	get value(): T {
		return this.#value;
	}

	set value(newValue: T) {
		this.#value = newValue;
	}
}
