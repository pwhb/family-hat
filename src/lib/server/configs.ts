import { decrypt } from './crypto';
import { Q } from './db';
import { getCache, setCache } from './redis';

export const getPageConfig = async (url: string) => await Q.findOne('pages', { url });

interface IConfig {
	type: string;
	value: string;
}
const getConfigFromDB = async (key: string) => {
	const data = await Q.findOne('configs', { key });
	return {
		type: data?.type,
		value: data?.value
	};
};

const parseConfig = async (data: IConfig) => {
	if (data) {
		switch (data.type) {
			case 'json':
				return JSON.parse(data.value);
			case 'number':
				return parseFloat(data.value);
			case 'boolean':
				return data.value === 'true';
			case 'string':
				return data.value;
			case 'secured':
				return JSON.parse(await decrypt(data.value));
		}
	}
	return data.value ? data.value : null;
};

export const getConfig = async (key: string, useCache = false) => {
	if (useCache) {
		const cached = await getCache(key);
		if (cached) return await parseConfig(JSON.parse(cached));
	}
	const confFromDB = await getConfigFromDB(key);
	if (useCache) {
		await setCache(key, JSON.stringify(confFromDB));
	}
	return await parseConfig(confFromDB);
};
