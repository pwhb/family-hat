export const ENTITY_NAME_MAP: Record<string, string> = {
	configs: 'Config',
	families: 'Family',
	logs: 'Log',
	members: 'Member',
	users: 'User',
	questions: 'Question',
	relationships: 'Relationship',
	relation_types: 'Relation Type',
	pages: 'Page',
	menus: 'Menu',
	permissions: 'Permission',
	user_roles: 'User Role'
};

export const COL_LIST = [
	'configs',
	'families',
	'logs',
	'members',
	'users',
	'questions',
	'relationships',
	'relation_types',
	'pages',
	'menus',
	'permissions',
	'user_roles',
	'payments'
];

export const ADMIN_TOKEN = 'admin_token';
export const AUTH_STRATEGY = {
	BASIC: 'basic_token',
	BEARER: 'bearer_token'
};
export const SERVER_ENDPOINTS = {
	LOGIN: '/login',
	LOGIN_API: '/api/auth/login',
	CHANGE_PASSWORD_API: '/api/auth/changePassword',
	DASHBOARD: '/admin',
	LOGOUT: '/admin?/logout',
	MISSING_CONFIG_ERROR: '/error/missing-config',
	FORBIDDEN_ERROR: '/error/forbidden'
};
