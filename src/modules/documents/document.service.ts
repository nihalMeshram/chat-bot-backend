import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from './document.model';
import { MinioService } from '@common/services/minio.service';
import { MultipartFile } from '@fastify/multipart';
import { CreationAttributes } from 'sequelize';
import { plainToInstance } from 'class-transformer';
import {
  UploadDocumentResponseDto,
  GetDocumentUrlResponseDto,
  GetDocumentResponseDto,
} from './dtos';

@Injectable()
export class DocumentService {
  private readonly basePath = 'documents';
  constructor(
    @InjectModel(Document) private readonly documentModel: typeof Document,
    private readonly minioService: MinioService,
  ) { }

  async uploadDocument(file: MultipartFile, userId: string): Promise<UploadDocumentResponseDto> {
    const doc = await this.documentModel.build({
      fileName: file.filename,
      type: file.mimetype,
      createdBy: userId,
    } as CreationAttributes<Document>) as Document;

    await this.minioService.uploadStream(file.file, `${this.basePath}/${doc.id}`, file.mimetype);
    await doc.save(); // only save after upload success
    return plainToInstance(UploadDocumentResponseDto, doc.get({ plain: true }));
  }

  async getDocumentUrl(documentId: string): Promise<GetDocumentUrlResponseDto> {
    const document = await this.documentModel.findByPk(documentId);
    if (!document) throw new NotFoundException('Document not found');
    return { url: await this.minioService.getSignedUrl(`${this.basePath}/${documentId}`) };
  }

  async findAll(): Promise<GetDocumentResponseDto[]> {
    const documents = await this.documentModel.findAll();
    return plainToInstance(GetDocumentResponseDto, documents.map(document => document.get({ plain: true })));
  }
}
