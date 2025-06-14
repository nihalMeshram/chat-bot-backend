import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO returned after a document is successfully uploaded.
 */
export class IngestWebhookResponseDto {
  @ApiProperty({
    example: 'Document status update successfully',
  })
  message: string;
}
