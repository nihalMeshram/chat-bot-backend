import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { BadRequestException } from '@nestjs/common';
import { UploadDocumentResponseDto, GetDocumentResponseDto, GetDocumentUrlResponseDto } from './dtos';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;

  const mockUploadDocument: UploadDocumentResponseDto = {
    id: 'doc-id',
    fileName: 'test.pdf',
    status: 'un_ingested',
    type: 'application/pdf',
    createdBy: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const mockDocument: GetDocumentResponseDto = {
    id: 'doc-id',
    fileName: 'test.pdf',
    status: 'un_ingested',
    type: 'application/pdf',
    createdBy: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };

  const mockDocumentUrl: GetDocumentUrlResponseDto = {
    url: 'https://fake-url.com/document'
  }

  const mockService = {
    uploadDocument: jest.fn().mockResolvedValue(mockUploadDocument),
    getDocumentUrl: jest.fn().mockResolvedValue(mockDocumentUrl),
    findAll: jest.fn().mockResolvedValue([mockDocument]),
    deleteDocument: jest.fn().mockResolvedValue({ message: 'Document deleted successfully'}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [{ provide: DocumentService, useValue: mockService }],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('upload()', () => {
    it('should upload file and return document metadata', async () => {
      const file: Partial<MultipartFile> = {
        filename: 'test.pdf',
        type: 'file',
        mimetype: 'application/pdf',
        file: {} as any,
      };

      const req = {
        parts: async function* () {
          yield file;
        },
        user: { userId: 'user-id' },
      } as unknown as FastifyRequest;

      const result = await controller.upload(req);
      expect(result).toEqual(mockDocument);
      expect(service.uploadDocument).toHaveBeenCalledWith(file, 'user-id');
    });

    it('should throw BadRequestException when no file is uploaded', async () => {
      const req = {
        parts: async function* () {
          yield { type: 'field', filename: undefined };
        },
        user: { userId: 'user-id' },
      } as unknown as FastifyRequest;

      await expect(controller.upload(req)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDocumentUrl()', () => {
    it('should return signed document URL', async () => {
      const id = 'doc-id';
      const result = await controller.getDocumentUrl(id);
      expect(result).toEqual({ url: 'https://fake-url.com/document' });
      expect(service.getDocumentUrl).toHaveBeenCalledWith(id);
    });
  });

  describe('findAll()', () => {
    it('should return array of documents', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockDocument]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('deleteDocument()', () => {
    it('should delete the document and return a success message', async () => {
      const mockDeleteResponse = { message: 'Document deleted successfully' };
      const docId = 'doc-id';

      // Add the mocked delete method to the service
      mockService.deleteDocument = jest.fn().mockResolvedValue(mockDeleteResponse);

      const result = await controller.deleteDocument(docId);

      expect(service.deleteDocument).toHaveBeenCalledWith(docId);
      expect(result).toEqual(mockDeleteResponse);
    });
  });

});
