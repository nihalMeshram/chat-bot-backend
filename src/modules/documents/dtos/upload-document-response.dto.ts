import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO returned after a document is successfully uploaded.
 */
export class UploadDocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the uploaded document',
    example: 'a12b34cd-56ef-78gh-90ij-klmnopqrstuv',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Original filename of the uploaded document',
    example: 'resume.pdf',
  })
  @Expose()
  fileName: string;

  @ApiProperty({
    description: 'Uploaded document status',
    example: 'un_ingested',
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: 'MIME type of the uploaded file',
    example: 'application/pdf',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'ID of the user who uploaded the document',
    example: 'user-123',
  })
  @Expose()
  createdBy: string;

  @ApiProperty({
    description: 'Timestamp when the document was created',
    example: '2025-06-10T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the document was last updated',
    example: '2025-06-11T08:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  // Excluded from response to hide soft-delete status
  @Exclude()
  deletedAt?: Date;
}
