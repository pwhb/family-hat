// src/hooks.ts (Safe for both server and browser)
import type { Transport } from '@sveltejs/kit';

export const transport: Transport = {
	MongoID: {
		// Check the constructor name as a string to avoid importing 'mongodb' on the client
		encode: (value) => {
			return value && typeof value === 'object' && value.constructor.name === 'ObjectId'
				? value.toString()
				: false;
		},
		// Leave it as a plain string on the client frontend
		decode: (stringId) => stringId
	}
};
