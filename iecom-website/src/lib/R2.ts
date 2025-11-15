import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.R2_ACCOUNT_ID ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET_NAME
) {
  throw new Error("Cloudflare R2 environment variables are not set.");
}

const R2_ENDPOINT = `https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com`;

export const R2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT.replace(
    "<YOUR_ACCOUNT_ID>",
    process.env.R2_ACCOUNT_ID
  ),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadFileToR2 = async (file: File, folder: string, account_id: string) => {
  if (!file || file.size === 0) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop();
  const filename = `${folder}/${account_id}.${extension}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );
  return filename;
};

export async function getSignedUrlForR2(key: string | null) {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(R2, command, { expiresIn: 300 });
}