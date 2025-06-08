import { Module } from '@nestjs/common';
import { MinioService } from './services/minio.service';

@Module({
  providers: [MinioService]
})
export class CommonModule {}
