import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for returning document metadata information.
 */
export class GetDocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    example: 'c1a23bc4-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Original filename of the uploaded document',
    example: 'invoice-jan-2025.pdf',
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
    description: 'MIME type of the document',
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
    example: '2025-06-10T14:48:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the document was last updated',
    example: '2025-06-11T09:30:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  // Internal field, excluded from API response
  @Exclude()
  deletedAt?: Date;
}
