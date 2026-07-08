import { createLocalStorageStore } from './local.svelte';

export const userIdStore = createLocalStorageStore('userId', '');
