import { writable } from 'svelte/store';

export const langStore = writable<string>('en');
