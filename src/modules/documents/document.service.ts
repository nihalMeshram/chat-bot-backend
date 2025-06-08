import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from './document.model';
import { MinioService } from '@common/services/minio.service';
import { MultipartFile } from '@fastify/multipart';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class DocumentService {
  private basePath = 'documents';
  constructor(
    @InjectModel(Document) private readonly documentModel: typeof Document,
    private readonly minioService: MinioService,
  ) { }

  async uploadDocument(file: MultipartFile, userId: string) {
    const doc = await this.documentModel.build({
      fileName: file.filename,
      type: file.mimetype,
      createdBy: userId,
    } as CreationAttributes<Document>) as Document;

    try {
      await this.minioService.uploadStream(file.file, `${this.basePath}/${doc.id}`, file.mimetype);
      await doc.save(); // only save after upload success
      return doc;
    } catch (err) {
      // optional: log error or rethrow
      throw new Error('File upload failed, document not saved.');
    }
  }

  async getDocumentUrl(documentId: string) {
    return this.minioService.getSignedUrl(`${this.basePath}/${documentId}`);
  }

  async findAll(): Promise<Document[]> {
    return await this.documentModel.findAll();
  }
}
