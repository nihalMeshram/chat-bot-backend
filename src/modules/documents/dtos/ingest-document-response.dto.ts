import { ApiProperty } from '@nestjs/swagger';

export class IngestDocumentResponseDto {
  @ApiProperty({ example: 'Ingestion triggered successfully.' })
  message: string;
}