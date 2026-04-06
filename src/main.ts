import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

// Load env variables early
const result = dotenv.config();
console.log('Dotenv config result:', result.error ? 'Error' : 'Success');
console.log('Injecting env count:', result.parsed ? Object.keys(result.parsed).length : 0);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 'undefined');

// Senior-level additions
import helmet from 'helmet';
import * as compression from 'compression';
const comp = require('compression');

import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Security Headers
  app.use(helmet());

  // Compression for Performance
  app.use(comp());

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global Exception Handling & Response Intercepting
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('PMS API')
    .setDescription('Phần mềm quản lý trường học API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
