import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;

const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToR2(
    fileBuffer: Uint8Array,
    filename: string,
    contentType: string
): Promise<string> {
    const key = `photos/photo/${filename}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        })
    );

    return `${R2_PUBLIC_DOMAIN}/${key}`;
}

export async function deleteFromR2(imageUrl: string): Promise<void> {
    const key = imageUrl.replace(`${R2_PUBLIC_DOMAIN}/`, '');
    await s3.send(
        new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        })
    );
}
