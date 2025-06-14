import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cors from '@fastify/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  const config = new DocumentBuilder()
    .setTitle('Chat Bot API')
    .setDescription('API for chat bot')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // throws error on unknown fields
      transform: true, // auto-transform to DTO types (e.g. string → number)
    }),
  );

  // ✅ Register CORS plugin
  await app.register(cors, {
    origin: true, // allow all origins
    credentials: true, // if using cookies/auth
  });

  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024
    }
  });
  await app.register(fastifyCookie);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  await app.listen(port, host);
  console.log(`Server running at http://${host}:${port}`);
}
bootstrap();
