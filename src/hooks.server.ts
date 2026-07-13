// src/hooks.server.ts
import { apiGuard } from '$lib/server/middleware/api';
import { authGuard } from '$lib/server/middleware/auth';
import { globalGuard } from '$lib/server/middleware/global';
import { pageGuard } from '$lib/server/middleware/page';

import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(globalGuard, authGuard, pageGuard, apiGuard);
