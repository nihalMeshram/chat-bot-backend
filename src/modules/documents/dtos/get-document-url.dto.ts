import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for returning a signed document download URL.
 */
export class GetDocumentUrlResponseDto {
  @ApiProperty({
    description: 'A secure signed URL to access the document',
    example: 'https://minio.example.com/documents/abc123?X-Amz-Signature=...',
  })
  @Expose()
  url: string;
}
