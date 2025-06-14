import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { MinioService } from '@common/services/minio.service';
import { getModelToken } from '@nestjs/sequelize';
import { Document } from './document.model';
import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus } from './types/document.status.type';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentModelMock: any;
  let minioServiceMock: MinioService;
  let configService: ConfigService;

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

    const configServiceMock = {
      get: jest.fn().mockReturnValue('http://python-backend'),
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
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    minioServiceMock = module.get<MinioService>(MinioService);
    configService = module.get<ConfigService>(ConfigService)
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

  describe('deleteDocumentUrl', () => {
    it('should delete document and return success message', async () => {
      const documentId = 'uuid-123';

      // Mock findByPk to return a document
      documentModelMock.findByPk.mockResolvedValue(mockDocumentInstance);
      // Mock destroy
      documentModelMock.destroy = jest.fn().mockResolvedValue(1);
      // Mock minio deleteObject
      minioServiceMock.deleteObject = jest.fn().mockResolvedValue(undefined);

      const result = await service.deleteDocument(documentId);

      expect(documentModelMock.findByPk).toHaveBeenCalledWith(documentId);
      expect(minioServiceMock.deleteObject).toHaveBeenCalledWith(`documents/${documentId}`);
      expect(documentModelMock.destroy).toHaveBeenCalledWith({
        where: { id: documentId },
        force: true,
      });
      expect(result).toEqual({ message: 'Document deleted successfully' });
    });

    it('should throw NotFoundException if document does not exist', async () => {
      documentModelMock.findByPk.mockResolvedValue(null);

      await expect(service.deleteDocument('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDocumentStatus', () => {
    it('should update the document status if valid', async () => {
      const mockSave = jest.fn();
      documentModelMock.findByPk.mockResolvedValue({ ...mockDocumentInstance, save: mockSave });

      await service.updateDocumentStatus('uuid-123', DocumentStatus.INGESTING);

      expect(documentModelMock.findByPk).toHaveBeenCalledWith('uuid-123');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid status', async () => {
      documentModelMock.findByPk.mockResolvedValue(mockDocumentInstance);

      await expect(service.updateDocumentStatus('uuid-123', 'invalid_status' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if document does not exist', async () => {
      documentModelMock.findByPk.mockResolvedValue(null);

      await expect(service.updateDocumentStatus('invalid-id', DocumentStatus.FAILED)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('triggerIngestion', () => {
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      fetchMock = jest.spyOn(global, 'fetch' as any).mockImplementation();
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    it('should trigger ingestion and update document status', async () => {
      const mockUpdate = jest.fn();
      const mockDoc = {
        ...mockDocumentInstance,
        update: mockUpdate,
      };
      documentModelMock.findByPk.mockResolvedValue(mockDoc);
      (minioServiceMock.getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

      fetchMock.mockResolvedValue({ ok: true });

      const result = await service.triggerIngestion('uuid-123');

      expect(configService.get).toHaveBeenCalledWith('PYTHON_BACKEND_URL');
      expect(minioServiceMock.getSignedUrl).toHaveBeenCalledWith('documents/uuid-123');
      expect(fetchMock).toHaveBeenCalledWith('http://python-backend/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'uuid-123',
          downloadUrl: 'https://signed.url',
        }),
      });
      expect(mockUpdate).toHaveBeenCalledWith({ status: DocumentStatus.INGESTING });
      expect(result).toEqual({ message: 'Ingestion triggered successfully' });
    });

    it('should throw error if fetch fails', async () => {
      const mockDoc = {
        ...mockDocumentInstance,
        update: jest.fn(),
      };
      documentModelMock.findByPk.mockResolvedValue(mockDoc);
      (minioServiceMock.getSignedUrl as jest.Mock).mockResolvedValue('https://signed.url');

      fetchMock.mockResolvedValue({ ok: false, statusText: 'Internal Server Error' });
      await expect(service.triggerIngestion('uuid-123')).rejects.toThrow('Failed to trigger ingestion: Internal Server Error');
      expect(configService.get).toHaveBeenCalledWith('PYTHON_BACKEND_URL');
    });
  });

});
