import { ENCRYPTION_SECRET } from '$env/static/private';
import { seal, unseal, defaults } from 'iron-webcrypto';

const PASSWORD = ENCRYPTION_SECRET;
const TTL = 0;

export async function encrypt(data: string): Promise<string> {
	return await seal(data, PASSWORD, {
		...defaults,
		ttl: TTL
	});
}

export async function decrypt(data: string): Promise<string> {
	try {
		const decrypted = await unseal(data, PASSWORD, {
			...defaults,
			ttl: TTL
		});
		return decrypted as string;
	} catch (error) {
		throw new Error('Failed to decrypt data: Token has been altered or secret key is invalid.');
	}
}
