import { REDIS_URL } from '$env/static/private';
import { createClient } from 'redis';

const client = createClient({
	url: REDIS_URL
});

client.on('error', (err) => {
	console.error('Redis Client Error:', err);
});

async function getConnectedClient() {
	if (!client.isOpen) {
		await client.connect();
	}
	return client;
}

export async function getCache(key: string): Promise<string | null> {
	try {
		const redis = await getConnectedClient();
		return await redis.get(key);
	} catch (error) {
		console.error(`Failed to GET cache for key: ${key}`, error);
		return null;
	}
}

export async function setCache(key: string, value: string, ttlSeconds?: number): Promise<void> {
	try {
		const redis = await getConnectedClient();
		if (ttlSeconds) {
			await redis.set(key, value, { EX: ttlSeconds });
		} else {
			await redis.set(key, value);
		}
	} catch (error) {
		console.error(`Failed to SET cache for key: ${key}`, error);
	}
}

export async function delCache(key: string): Promise<void> {
	try {
		const redis = await getConnectedClient();
		await redis.del(key);
	} catch (error) {
		console.error(`Failed to DELETE cache for key: ${key}`, error);
	}
}
