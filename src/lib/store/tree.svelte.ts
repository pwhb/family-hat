import { setContext, getContext } from 'svelte';

interface ActivePathContext {
	readonly activePath: any;
}

const ACTIVE_PATH_KEY = Symbol('ACTIVE_PATH');

export function setActivePathContext(getActivePath: () => any) {
	setContext<ActivePathContext>(ACTIVE_PATH_KEY, {
		get activePath() {
			return getActivePath();
		}
	});
}

export function getActivePathContext(): ActivePathContext {
	return getContext<ActivePathContext>(ACTIVE_PATH_KEY);
}
