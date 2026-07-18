// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			config: any;
			pageConfig: any;
			adminConfig: any;
			user: any;
			identifier: string;
			pageUrl: string;
			isPublic: boolean;
			rbac: any;
			menus: any[];
			pageName?: string;
			pageId?: string;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
