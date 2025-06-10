import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FastifyRequest } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { AuthGuard } from '@nestjs/passport';
import {
  UploadDocumentResponseDto,
  GetDocumentUrlResponseDto,
  GetDocumentResponseDto,
} from './dtos';

@Controller('documents')
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
  constructor(private readonly docService: DocumentService) { }

  @Post('upload')
  async upload(@Req() req: FastifyRequest): Promise<UploadDocumentResponseDto> {
    const parts = req.parts();
    const userId = (req.user as any).userId;
    for await (const part of parts) {
      if (part.type === 'file' && part.filename) {
        const file = part as MultipartFile;
        return this.docService.uploadDocument(file, userId);
      }
    }
    throw new BadRequestException('No file uploaded');
  }

  @Get(':id')
  async getDocumentUrl(@Param('id', new ParseUUIDPipe()) id: string): Promise<GetDocumentUrlResponseDto> {
    return await this.docService.getDocumentUrl(id);
  }

  @Get()
  async findAll(): Promise<GetDocumentResponseDto[]> {
    return await this.docService.findAll();
  }
}
