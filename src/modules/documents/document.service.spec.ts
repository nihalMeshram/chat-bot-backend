import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { MinioService } from '@common/services/minio.service';
import { getModelToken } from '@nestjs/sequelize';
import { Document } from './document.model';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentModelMock: any;
  let minioServiceMock: MinioService;

  const mockDocumentInstance = {
    id: 'uuid-123',
    fileName: 'test.pdf',
    type: 'application/pdf',
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    get: jest.fn().mockReturnValue({
      id: 'uuid-123',
      fileName: 'test.pdf',
      type: 'application/pdf',
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    save: jest.fn(),
  };

  beforeEach(async () => {
    documentModelMock = {
      build: jest.fn().mockReturnValue(mockDocumentInstance),
      findByPk: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getModelToken(Document),
          useValue: documentModelMock,
        },
        {
          provide: MinioService,
          useValue: {
            uploadStream: jest.fn(),
            getSignedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    minioServiceMock = module.get<MinioService>(MinioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload document and return metadata', async () => {
      const mockFile = {
        filename: 'test.pdf',
        mimetype: 'application/pdf',
        file: new Readable(),
      } as any;

      (minioServiceMock.uploadStream as jest.Mock).mockResolvedValue(undefined);
      await service.uploadDocument(mockFile, 'user-1');

      expect(documentModelMock.build).toHaveBeenCalledWith({
        fileName: 'test.pdf',
        type: 'application/pdf',
        createdBy: 'user-1',
      });

      expect(minioServiceMock.uploadStream).toHaveBeenCalledWith(
        mockFile.file,
        'documents/uuid-123',
        'application/pdf',
      );

      expect(mockDocumentInstance.save).toHaveBeenCalled();
    });
  });

  describe('getDocumentUrl', () => {
    it('should return signed URL if document exists', async () => {
      documentModelMock.findByPk.mockResolvedValue(mockDocumentInstance);
      (minioServiceMock.getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

      const result = await service.getDocumentUrl('uuid-123');
      expect(result).toEqual({ url: 'https://signed.url' });
    });

    it('should throw NotFoundException if document not found', async () => {
      documentModelMock.findByPk.mockResolvedValue(null);

      await expect(service.getDocumentUrl('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all documents as DTOs', async () => {
      const docMock = {
        ...mockDocumentInstance,
        get: jest.fn().mockReturnValue({
          id: 'uuid-123',
          fileName: 'test.pdf',
          type: 'application/pdf',
          createdBy: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };
      documentModelMock.findAll.mockResolvedValue([docMock]);

      const result = await service.findAll();

      expect(documentModelMock.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-123');
    });
  });
});
