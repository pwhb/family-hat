import { LocalStorageState } from './local.svelte';

export const userId = new LocalStorageState<string>('userId', 'en');
