import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Document } from './document.model';

@Module({
  imports: [SequelizeModule.forFeature([Document])],
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule {}
