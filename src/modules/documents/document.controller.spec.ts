import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentStatusService } from './document-status.service';
import { BadRequestException } from '@nestjs/common';
import { UploadDocumentResponseDto, GetDocumentResponseDto, GetDocumentUrlResponseDto } from './dtos';
import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';
import { IngestWebhookRequestDto } from './dtos/ingest-webhook-request.dto';
import { of } from 'rxjs';
import { DocumentStatus } from './types/document.status.type';

describe('DocumentController', () => {
  let controller: DocumentController;
  let service: DocumentService;
  let statusService: DocumentStatusService;

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
  };

  const mockService = {
    uploadDocument: jest.fn().mockResolvedValue(mockUploadDocument),
    getDocumentUrl: jest.fn().mockResolvedValue(mockDocumentUrl),
    findAll: jest.fn().mockResolvedValue([mockDocument]),
    deleteDocument: jest.fn().mockResolvedValue({ message: 'Document deleted successfully' }),
    triggerIngestion: jest.fn().mockResolvedValue({ message: 'Ingestion triggered successfully' }),
    updateDocumentStatus: jest.fn().mockResolvedValue(undefined),
  };

  const mockStatusService = {
    subscribe: jest.fn().mockReturnValue(of({ data: { documentId: 'doc-id', status: 'ingesting' } })),
    emitStatus: jest.fn(),
    complete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        { provide: DocumentService, useValue: mockService },
        { provide: DocumentStatusService, useValue: mockStatusService },
      ],
    }).compile();

    controller = module.get<DocumentController>(DocumentController);
    service = module.get<DocumentService>(DocumentService);
    statusService = module.get<DocumentStatusService>(DocumentStatusService);
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
      const docId = 'doc-id';
      const result = await controller.deleteDocument(docId);
      expect(service.deleteDocument).toHaveBeenCalledWith(docId);
      expect(result).toEqual({ message: 'Document deleted successfully' });
    });
  });

  describe('triggerIngestion()', () => {
    it('should call triggerIngestion service and return success message', async () => {
      const docId = 'doc-id';
      const result = await controller.triggerIngestion(docId);
      expect(service.triggerIngestion).toHaveBeenCalledWith(docId);
      expect(result).toEqual({ message: 'Ingestion triggered successfully' });
    });
  });

  describe('streamStatus()', () => {
    it('should return observable for status updates', (done) => {
      const docId = 'doc-id';
      const stream$ = controller.streamStatus(docId);
      stream$.subscribe({
        next: (event) => {
          expect((event.data as { documentId: string; status: string }).documentId).toBe(docId);
          expect((event.data as { documentId: string; status: string }).status).toBe('ingesting');
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('updateStatus()', () => {
    it('should update status, emit SSE and complete on INGESTED/FAILED', async () => {
      const dto: IngestWebhookRequestDto = {
        documentId: 'doc-id',
        status: DocumentStatus.INGESTED,
      };

      const result = await controller.updateStatus(dto);

      expect(service.updateDocumentStatus).toHaveBeenCalledWith(dto.documentId, dto.status);
      expect(statusService.emitStatus).toHaveBeenCalledWith(dto.documentId, dto.status);
      expect(statusService.complete).toHaveBeenCalledWith(dto.documentId);
      expect(result).toEqual({ message: 'Document status update successfully' });
    });
  });
});
