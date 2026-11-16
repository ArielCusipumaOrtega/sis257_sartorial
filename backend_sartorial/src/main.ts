import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors();

  // Servir imágenes estáticas de uploads
  const uploadsDir = join(__dirname, '..', 'uploads');
  const uploadsDirFallback = join(process.cwd(), 'uploads');
  const finalUploadsDir = existsSync(uploadsDir) ? uploadsDir : uploadsDirFallback;
  if (!existsSync(finalUploadsDir)) {
    mkdirSync(finalUploadsDir, { recursive: true });
  }
  console.log(`Serving uploads from: ${finalUploadsDir}`);
  app.use('/uploads', express.static(finalUploadsDir));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Sartorial Prestige Boutique API')
    .setDescription('API REST Integral para Gestión de Boutique de Alta Confección & Estilo Formal - SIS257')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`=======================================================`);
  console.log(` Sartorial Prestige API ejecutándose en puerto ${port}`);
  console.log(` Endpoint API: http://localhost:${port}/api/v1`);
  console.log(` Swagger Docs: http://localhost:${port}/api/docs`);
  console.log(`=======================================================`);
}
bootstrap();
