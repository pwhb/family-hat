import { writable } from 'svelte/store';
import { createLocalStorageStore } from './store';

export const langStore = createLocalStorageStore("lang", "en")
