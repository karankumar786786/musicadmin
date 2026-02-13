import { S3Client } from "@aws-sdk/client-s3";
// Initialize the client (Configure for your specific CDN/S3 provider)
export const s3Client = new S3Client({
  region: "ap-south-1" ,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY!,
  },
  // If using a custom S3-compatible service like RustFS or Cloudflare R2:
  // endpoint: process.env.AWS_ENDPOINT, 
  // forcePathStyle: true,
});