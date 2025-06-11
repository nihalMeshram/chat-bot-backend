import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
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
  let configServiceMock: Partial<Record<string, string>> = {};
  const mockGet = jest.fn((key: string) => configServiceMock[key]);

  beforeEach(async () => {
    configServiceMock = {
      MINIO_BUCKET: 'test-bucket',
      MINIO_ENDPOINT: 'http://localhost:9000',
      MINIO_ROOT_USER: 'test-user',
      MINIO_ROOT_PASSWORD: 'test-pass',
      MINIO_REGION: 'us-east-1',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: { get: mockGet },
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
      stream._read = () => { }; // required to avoid error

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
      const mockUrl = 'http://signed-url.com/test.pdf';
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
});
