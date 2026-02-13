import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "./s3Client";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getSignedUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string, publicUrl: string }> {
  try {
    const bucketName = process.env.NEXT_TEMP_BUCKET_NAME!;
    const region = process.env.AWS_REGION || "ap-south-1";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    // Construct public URL
    const baseUrl = process.env.CDN_URL || `https://${bucketName}.s3.${region}.amazonaws.com`;
    // Correctly encode the key to handle spaces and special characters
    const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const publicUrl = `${baseUrl}/${encodedKey}`;

    return { uploadUrl, publicUrl };
  } catch (e) {
    console.error("Presigned URL Error:", e);
    throw new Error("Failed to generate upload URL.");
  }
}

/**
 * Uploads a Buffer to S3 and returns the correct Regional Public/CDN URL
 */
export async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  try {
    const bucketName = process.env.NEXT_TEMP_BUCKET_NAME!;
    const region = process.env.AWS_REGION || "ap-south-1"; // Ensure region is set

    const parallelUploads3 = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5, // 5MB parts
    });

    await parallelUploads3.done();

    // 1. Construct the Base URL using the Regional Virtual-Hosted Style
    // Format: https://bucket-name.s3.region.amazonaws.com
    const baseUrl = process.env.CDN_URL || `https://${bucketName}.s3.${region}.amazonaws.com`;

    // 2. Correctly encode the key to handle spaces, plus signs, and special characters
    // We split by '/' so we don't encode the folder slashes themselves
    const encodedKey = key.split('/').map(segment => encodeURIComponent(segment)).join('/');

    // 3. Use a forward slash as the separator
    return `${baseUrl}/${encodedKey}`;

  } catch (e) {
    console.error("S3 Upload Error:", e);
    throw new Error("Failed to upload file to storage.");
  }
}

/**
 * Deletes an object from S3
 */
export async function deleteFromS3(key: string) {
  try {
    const bucketName = process.env.NEXT_TEMP_BUCKET_NAME!;
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`Deleted object from S3: ${key}`);
  } catch (e) {
    console.error("S3 Delete Error:", e);
  }
}