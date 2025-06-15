import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn(),
  })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('MinioService', () => {
  let service: MinioService;
  const configServiceMock = {
    get: jest.fn((key: string) => {
      const configMap: Record<string, string> = {
        MINIO_BUCKET: 'test-bucket',
        MINIO_ENDPOINT_INTERNAL: 'http://internal-minio:9000',
        MINIO_ENDPOINT_EXTERNAL: 'http://external-minio:9000',
        MINIO_ROOT_USER: 'test-user',
        MINIO_ROOT_PASSWORD: 'test-pass',
        MINIO_REGION: 'us-east-1',
      };
      return configMap[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<MinioService>(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadStream', () => {
    it('should create an Upload instance and call done()', async () => {
      const stream = new Readable();
      stream._read = () => { };

      const doneMock = jest.fn().mockResolvedValue(undefined);
      (Upload as unknown as jest.Mock).mockImplementation(() => ({ done: doneMock }));

      await service.uploadStream(stream, 'file-key', 'application/pdf');

      expect(Upload).toHaveBeenCalledWith({
        client: expect.any(S3Client),
        params: {
          Bucket: 'test-bucket',
          Key: 'file-key',
          Body: stream,
          ContentType: 'application/pdf',
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
        leavePartsOnError: false,
      });

      expect(doneMock).toHaveBeenCalled();
    });
  });

  describe('getSignedUrl', () => {
    it('should return a signed URL', async () => {
      const mockUrl = 'http://external-minio:9000/test.pdf';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUrl);

      const url = await service.getSignedUrl('file-key');

      expect(getSignedUrl).toHaveBeenCalledWith(
        expect.any(S3Client),
        expect.any(GetObjectCommand),
        { expiresIn: 3600 }
      );

      expect(url).toBe(mockUrl);
    });
  });

  describe('deleteObject', () => {
    it('should send a DeleteObjectCommand to internal S3 client', async () => {
      const sendMock = jest.fn().mockResolvedValue({});
      // Injecting the mocked send method into s3Internal
      (service as any).s3Internal.send = sendMock;

      await service.deleteObject('file-key-to-delete');

      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            Bucket: 'test-bucket',
            Key: 'file-key-to-delete',
          },
          constructor: DeleteObjectCommand,
        })
      );
    });
  });
});
