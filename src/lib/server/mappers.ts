import type { AsyncMapper } from './common';
import { getPresignedUrl } from './s3';

export const mappers = {
	convertToPresignedUrl: async (v: string) => {
		return v ? await getPresignedUrl({ key: v }) : null;
	}
} satisfies Record<string, AsyncMapper>;

export type MapperKey = keyof typeof mappers;
