import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO returned after a document is successfully uploaded.
 */
export class DeleteDocumentResponseDto {
  @ApiProperty({
    description: 'Delete document',
    example: 'Document deleted successfully',
  })
  message: string;
}
