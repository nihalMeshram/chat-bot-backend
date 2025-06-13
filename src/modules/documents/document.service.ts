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
  DeleteDocumentResponseDto,
} from './dtos';

@Injectable()
export class DocumentService {
  // Base path where documents will be stored in MinIO
  private readonly basePath = 'documents';

  constructor(
    @InjectModel(Document) private readonly documentModel: typeof Document, // Sequelize model for the Document entity
    private readonly minioService: MinioService, // Custom service for interacting with MinIO object storage
  ) { }

  /**
   * Handles the upload of a document to MinIO and saves metadata to the database.
   * @param file - The uploaded file as a stream (MultipartFile from Fastify)
   * @param userId - ID of the user uploading the file
   * @returns metadata of the uploaded document as DTO
   */
  async uploadDocument(file: MultipartFile, userId: string): Promise<UploadDocumentResponseDto> {
    // Prepare a new document instance with relevant metadata
    const doc = await this.documentModel.build({
      fileName: file.filename,
      type: file.mimetype,
      createdBy: userId,
    } as CreationAttributes<Document>) as Document;

    // Upload the file to MinIO using the generated document ID as its path
    await this.minioService.uploadStream(file.file, `${this.basePath}/${doc.id}`, file.mimetype);

    // Save document metadata only after successful file upload
    await doc.save();

    // Return sanitized response DTO
    return plainToInstance(UploadDocumentResponseDto, doc.get({ plain: true }));
  }

  /**
   * Generates a signed URL for downloading a document by ID.
   * @param documentId - UUID of the document
   * @returns an object containing the signed URL
   * @throws NotFoundException if the document does not exist
   */
  async getDocumentUrl(documentId: string): Promise<GetDocumentUrlResponseDto> {
    const document = await this.documentModel.findByPk(documentId);
    if (!document) throw new NotFoundException('Document not found');

    // Return a signed URL for secure download from MinIO
    return { url: await this.minioService.getSignedUrl(`${this.basePath}/${documentId}`) };
  }

  /**
   * Retrieves all uploaded documents from the database.
   * @returns list of document metadata as DTOs
   */
  async findAll(): Promise<GetDocumentResponseDto[]> {
    const documents = await this.documentModel.findAll();

    // Map and transform each document instance into a response DTO
    return plainToInstance(
      GetDocumentResponseDto,
      documents.map(document => document.get({ plain: true }))
    );
  }

  /**
   * Deletes a user (permanent delete).
   * @param documentId - UUID of the documen
   * @returns success message if document deleted successfully
   * @throws NotFoundException if the document does not exist
   */
  async deleteDocument(documentId: string): Promise<DeleteDocumentResponseDto> {
    const document = await this.documentModel.findByPk(documentId);
    if (!document) throw new NotFoundException('Document not found');
    await this.minioService.deleteObject(`${this.basePath}/${documentId}`);
    await this.documentModel.destroy({
      where: { id: documentId },
      force: true,
    });
    return { message: 'Document deleted successfully' };
  }
}
