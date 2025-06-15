import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  HttpCode,
  Delete,
  Sse,
  MessageEvent,
  Body,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { AuthGuard } from '@nestjs/passport';
import {
  UploadDocumentResponseDto,
  GetDocumentUrlResponseDto,
  GetDocumentResponseDto,
  UploadDocumentDto,
  DeleteDocumentResponseDto,
  IngestWebhookRequestDto,
  IngestWebhookResponseDto,
  IngestDocumentResponseDto,
  IngestStatusStreamEventDto,
} from './dtos';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { DocumentStatusService } from './document-status.service';
import { DocumentStatus } from './types/document.status.type';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from 'modules/users/types/user-role.type';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard) // Applies JWT authentication and role-based authorization
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class DocumentController {
  constructor(
    private readonly docService: DocumentService,
    private readonly docStatusService: DocumentStatusService,
  ) { }

  /**
   * Upload a document file.
   * Route: POST /documents/upload
   * Requires a multipart/form-data file part.
   * Retrieves user ID from the request's JWT payload.
   * Returns document metadata after upload.
   */
  @Post('upload')
  @HttpCode(201)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadDocumentDto })
  @ApiCreatedResponse({
    description: 'Upload document successfully',
    type: UploadDocumentResponseDto,
  })
  @ApiOperation({
    summary: 'Upload document',
    description: 'Upload a document using multipart/form-data',
  })
  async upload(@Req() req: FastifyRequest): Promise<UploadDocumentResponseDto> {
    const parts = req.parts(); // Access multipart parts from Fastify
    const userId = (req.user as any).userId; // Extract user ID from JWT payload

    // Iterate through parts and handle the first file found
    for await (const part of parts) {
      if (part.type === 'file' && part.filename) {
        const file = part as MultipartFile;
        return this.docService.uploadDocument(file, userId);
      }
    }

    // If no file was found in the request, throw a 400 error
    throw new BadRequestException('No file uploaded');
  }

  /**
   * Get a secure download URL for a document.
   * Route: GET /documents/download/:id
   * @param id - UUID of the document
   * Returns a signed URL or equivalent to download the file.
   */
  @Get('download/:id')
  @ApiOkResponse({
    description: 'Fetch document url successfully.',
    type: GetDocumentUrlResponseDto,
  })
  @ApiOperation({
    summary: 'Fetch document url',
    description: 'Returns downloadable document url',
  })
  async getDocumentUrl(@Param('id', new ParseUUIDPipe()) id: string): Promise<GetDocumentUrlResponseDto> {
    return await this.docService.getDocumentUrl(id);
  }

  /**
   * Deletes a document (permanent delete).
   * @param documentId - UUID of the documen
   * @returns success message if document deleted successfully
   * @throws NotFoundException if the document does not exist
   */
  @Delete(':id')
  @ApiOkResponse({
    description: 'Delete document successfully.',
    type: DeleteDocumentResponseDto,
  })
  @ApiOperation({
    summary: 'Delete document',
    description: 'Deletes a document',
  })
  async deleteDocument(@Param('id', new ParseUUIDPipe()) id: string): Promise<DeleteDocumentResponseDto> {
    return await this.docService.deleteDocument(id);
  }

  /**
   * List all uploaded documents.
   * Route: GET /documents
   * Returns an array of document metadata.
   */
  @Get()
  @ApiOkResponse({
    description: 'Fetch all documents successfully.',
    type: GetDocumentResponseDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Fetch all documents',
    description: 'Returns all documents',
  })
  async findAll(): Promise<GetDocumentResponseDto[]> {
    return await this.docService.findAll();
  }

  /**
   * Trigger ingestion for a specific document.
   * This calls a another service (e.g., Python backend).
   */
  @Post('ingest/:id')
  @ApiOperation({ summary: 'Trigger document ingestion' })
  @ApiOkResponse({
    description: 'Ingestion triggered successfully.',
    type: IngestDocumentResponseDto,
  })
  async triggerIngestion(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.docService.triggerIngestion(id);
  }

  /**
   * Server-Sent Events endpoint to subscribe to real-time ingestion status updates.
   * Frontend should listen to this stream to get live progress.
   */
  @Sse('ingest/status/:id/stream')
  @ApiOperation({ summary: 'Subscribe to document ingestion status updates (SSE)' })
  @ApiOkResponse({
    description: 'Live status stream for document ingestion.',
    type: IngestStatusStreamEventDto,
  })
  streamStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Observable<MessageEvent> {
    return this.docStatusService.subscribe(id);
  }

  /**
   * Webhook endpoint to update the document ingestion status.
   * Called by the backend ingestion engine (e.g., Python service).
   */
  @Post('ingest/webhook')
  @ApiOperation({
    summary: 'Update document ingestion status & publish event',
  })
  @ApiOkResponse({
    description: 'Document status updated and SSE event emitted.',
    type: IngestWebhookResponseDto,
  })
  async updateStatus(
    @Body() body: IngestWebhookRequestDto,
  ): Promise<IngestWebhookResponseDto> {
    this.docStatusService.emitStatus(body.documentId, body.status);

    if ([DocumentStatus.INGESTED, DocumentStatus.FAILED].includes(body.status)) {
      this.docStatusService.complete(body.documentId);
      await this.docService.updateDocumentStatus(body.documentId, body.status);
      return { message: 'Document status has been updated to ' + body.status };
    } else {
      return { message: 'Document current status is ' + body.status };
    }
  }
}
