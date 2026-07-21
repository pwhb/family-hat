import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getConfig } from './configs';
import { BUCKET_ENDPOINT, BUCKET_NAME, BUCKET_REGION } from '$env/static/private';
import { S3_URL_EXPIRES_IN } from '$lib/consts';

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

interface IGetPresignedUploadUrlParams {
	key: string;
	contentType: string;
	expiresIn?: number;
	client?: S3Client;
}

export async function getPresignedUploadUrl({
	key,
	contentType,
	expiresIn = S3_URL_EXPIRES_IN,
	client
}: IGetPresignedUploadUrlParams): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key,
		ContentType: contentType
	});
	const s3Client = client ? client : await getS3Client();
	return await getSignedUrl(s3Client, command, { expiresIn });
}

interface IGetPresignedUrlParams {
	key: string;
	expiresIn?: number;
	client?: S3Client;
}

export async function getPresignedUrl({
	key,
	expiresIn = S3_URL_EXPIRES_IN,
	client
}: IGetPresignedUrlParams): Promise<string> {
	const command = new GetObjectCommand({
		Bucket: BUCKET_NAME,
		Key: key
	});
	const s3Client = client ? client : await getS3Client();
	return await getSignedUrl(s3Client, command, { expiresIn });
}
