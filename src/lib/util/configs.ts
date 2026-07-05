import { DB_NAME } from '$env/static/private';
import clientPromise from '../db';
import { getCache, setCache } from './redis';

const getConfigFromDB = async (key: string) => {
	const client = await clientPromise;
	const col = client.db(DB_NAME).collection('configs');
	const data = await col.findOne({ key });
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
		}
	}
	return data?.value;
};

export const getConfig = async (key: string) => {
	const cached = await getCache(key);
	if (cached) return JSON.parse(cached);
	const confFromDB = await getConfigFromDB(key);
	await setCache(key, JSON.stringify(confFromDB));
	return confFromDB;
};
