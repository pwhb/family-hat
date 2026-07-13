import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const { config, pageConfig } = locals;
	return {
		config,
		pageConfig: pageConfig.configs
	};
};
