/**
 * S3-compatible object storage. Works with AWS S3, Cloudflare R2,
 * Backblaze B2, Wasabi, MinIO — anything speaking the S3 API.
 *
 * Set S3_ENDPOINT to point at a non-AWS backend (R2 etc.). Otherwise
 * defaults to AWS S3 in the given region.
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.S3_REGION ?? "us-east-1";
const endpoint = process.env.S3_ENDPOINT; // optional (R2 etc.)
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET;

if (!accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    "S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET are required",
  );
}

export const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: !!endpoint, // R2 / MinIO need path-style addressing
  credentials: { accessKeyId, secretAccessKey },
});

export const BUCKET = bucket;

export async function putObject(input: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Generate a presigned PUT URL for client-side direct uploads (15 min default). */
export async function presignPut(key: string, expiresSec = 900) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresSec },
  );
}

/** Generate a presigned GET URL for private downloads (15 min default). */
export async function presignGet(key: string, expiresSec = 900) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: expiresSec },
  );
}
