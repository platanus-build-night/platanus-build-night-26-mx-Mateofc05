// S3-compatible storage layer (Railway bucket). The bucket is private, so reads
// go through short-lived presigned URLs. forcePathStyle is required for
// non-AWS S3-compatible endpoints.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const globalForS3 = globalThis as unknown as {
  __lineupS3?: S3Client;
};

function getBucket(): string {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME is not set. Add it to .env.");
  }
  return bucket;
}

function getClient(): S3Client {
  if (!globalForS3.__lineupS3) {
    const {
      S3_ENDPOINT,
      S3_REGION,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
    } = process.env;

    if (
      !S3_ENDPOINT ||
      !S3_REGION ||
      !S3_ACCESS_KEY_ID ||
      !S3_SECRET_ACCESS_KEY
    ) {
      throw new Error(
        "Missing S3 configuration. Set S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY in .env.",
      );
    }

    globalForS3.__lineupS3 = new S3Client({
      endpoint: S3_ENDPOINT,
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
      // Required for S3-compatible (non-AWS) endpoints like Railway.
      forcePathStyle: true,
    });
  }
  return globalForS3.__lineupS3;
}

/** Upload a file (e.g. athlete video or photo). Returns the object key. */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
): Promise<string> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

/** Generate a temporary presigned URL to read a private object. */
export async function getSignedReadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

/** Delete an object from the bucket. */
export async function deleteFile(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(), Key: key }),
  );
}
