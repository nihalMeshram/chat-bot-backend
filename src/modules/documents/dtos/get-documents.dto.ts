import { Exclude, Expose } from 'class-transformer';

export class GetDocumentResponseDto {
  @Expose()
  id: string;

  @Expose()
  fileName: string;

  @Expose()
  type: string;

  @Expose()
  createdBy: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;
}
