import { LocalStorageState } from './local.svelte';

export const lang = new LocalStorageState<string>('lang', 'en');
