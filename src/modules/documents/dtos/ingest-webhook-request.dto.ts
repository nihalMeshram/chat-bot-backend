import { DocumentStatus } from '../types/document.status.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';

export class IngestWebhookRequestDto {
  @ApiProperty({ description: 'Document ID', format: 'uuid' })
  @IsUUID()
  documentId: string;

  @ApiProperty({
    enum: DocumentStatus,
    description: 'New document status',
    example: DocumentStatus.INGESTED,
  })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;
}
