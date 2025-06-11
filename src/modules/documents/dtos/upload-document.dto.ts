import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Document file to upload',
  })
  file: any; // Keep it as `any` because `MultipartFile` is runtime, not class-level
}
