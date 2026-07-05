import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getConfig } from './configs';
import { BUCKET_ENDPOINT, BUCKET_NAME, BUCKET_REGION } from '$env/static/private';

let cachedS3Client: S3Client | null = null;
let cachedClientCredentialsString: string | null = null;

async function getS3Client(): Promise<S3Client> {
	const s3Config = await getConfig('S3_CONFIG');
	if (cachedClientCredentialsString !== JSON.stringify(s3Config)) {
		cachedS3Client = null;
	}
	if (!cachedS3Client) {
		cachedS3Client = new S3Client({
			region: BUCKET_REGION,
			endpoint: BUCKET_ENDPOINT,
			credentials: s3Config
		});
		cachedClientCredentialsString = JSON.stringify(s3Config);
	}

	return cachedS3Client;
}

export async function getPresignedUploadUrl(
	key: string,
	contentType: string,
	expiresIn = 900
): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType
	});
	const s3Client = await getS3Client();
	return await getSignedUrl(s3Client, command, { expiresIn });
}
