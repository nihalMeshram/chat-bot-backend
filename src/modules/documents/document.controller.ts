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
} from './dtos';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@Controller('documents')
@UseGuards(AuthGuard('jwt')) // Protect all routes with JWT authentication
export class DocumentController {
  constructor(private readonly docService: DocumentService) { }

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
   * Route: GET /documents/:id
   * @param id - UUID of the document
   * Returns a signed URL or equivalent to download the file.
   */
  @Get(':id')
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
}
