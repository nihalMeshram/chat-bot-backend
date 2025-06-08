import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioService {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'documents');

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: this.configService.get<string>('MINIO_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('MINIO_ROOT_USER') || '',
        secretAccessKey: this.configService.get<string>('MINIO_ROOT_PASSWORD') || '',
      },
      forcePathStyle: true,
    });
  }

  async upload(buffer: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await this.s3.send(command);
  }

  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.s3, command, { expiresIn: 3600 });
  }
}
