import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

/**
 * Service to handle file operations with MinIO using AWS S3-compatible SDK.
 */
@Injectable()
export class MinioService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  /**
   * Initializes the MinioService with configuration for S3 client.
   * Reads credentials and connection info from environment variables via ConfigService.
   */
  constructor(private readonly configService: ConfigService) {
    // Retrieve bucket name from environment variables
    this.bucket = this.configService.get<string>('MINIO_BUCKET') as string;

    // Initialize the S3 client to communicate with MinIO server
    this.s3 = new S3Client({
      region: this.configService.get<string>('MINIO_REGION') || 'us-east-1',
      endpoint: this.configService.get<string>('MINIO_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ROOT_USER') as string,
        secretAccessKey: this.configService.get<string>('MINIO_ROOT_PASSWORD') as string,
      },
      // Use path-style URLs (e.g., http://localhost:9000/bucket/key)
      forcePathStyle: true,
    });
  }

  /**
   * Uploads a readable stream (e.g., from a file upload) to MinIO.
   * Uses multipart upload with configuration for performance and reliability.
   *
   * @param stream - Readable stream of the file
   * @param key - Key (path/filename) under which file will be stored
   * @param contentType - MIME type of the file
   */
  async uploadStream(stream: Readable, key: string, contentType: string) {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType,
      },
      queueSize: 4, // Number of parts to upload in parallel
      partSize: 5 * 1024 * 1024, // 5 MB per part
      leavePartsOnError: false, // Cleanup on failure
    });

    // Wait for the upload to complete
    await upload.done();
  }

  /**
   * Generates a pre-signed URL for accessing a file stored in MinIO.
   * This allows temporary, secure access to private files without exposing credentials.
   *
   * @param key - The key (path/filename) of the file to access
   * @returns A signed URL valid for 1 hour
   */
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    // Generate signed URL with 1-hour expiry
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }
}
