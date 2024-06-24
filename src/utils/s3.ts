import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { unstable_cache } from 'next/cache';

export const s3Client = new S3Client({
  endpoint: process.env.BLACKBLAZE_ENDPOINT!,
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  bucketName: string,
  fileName: string,
  content: string,
  contentType: string = 'text/markdown'
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: content,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Generate URLs
    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return {
      fileUrl,
      fileName,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export const getFileFromS3 = async (
  bucketName: string,
  fileName: string
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('No content received from S3');
    }

    // Convert the readable stream to string
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    return Buffer.concat(chunks).toString('utf-8');
  } catch (error) {
    console.error('Error fetching from S3:', error);
    throw new Error('Failed to fetch file from S3');
  }
};
