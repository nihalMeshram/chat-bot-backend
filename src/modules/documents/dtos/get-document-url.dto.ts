import { Expose } from 'class-transformer';

export class GetDocumentUrlResponseDto {
  @Expose()
  url: string;
}
