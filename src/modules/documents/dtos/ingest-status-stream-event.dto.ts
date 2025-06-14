import { ApiProperty } from '@nestjs/swagger';
import { DocumentStatus } from '../types/document.status.type';

export class IngestStatusStreamEventDto {
  @ApiProperty({ example: 'c1a23bc4-e89b-12d3-a456-426614174000' })
  documentId: string;

  @ApiProperty({ enum: DocumentStatus, example: DocumentStatus.INGESTING })
  status: DocumentStatus;
}
