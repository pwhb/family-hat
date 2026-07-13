import { DB_NAME } from '$env/static/private';
import clientPromise from '../db';
import { decrypt } from './crypto';
import { getCache, setCache } from './redis';

interface IConfig {
	type: string;
	value: string;
}

export const getPageConfig = async (url: string) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('pages');
	return await col.findOne({ url });
};

const getConfigFromDB = async (key: string) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('configs');
	const data = await col.findOne({ key });
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
