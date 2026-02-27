import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './Common/Filters/http-exception';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bufferLogs: true});

  app.use((cookieParser as any)());
  app.setGlobalPrefix('api.ata-ruyus/v1');
  
  const config = new DocumentBuilder()
  .setTitle("ATA-RUYUS API")
  .setDescription("A API ATA-RUYUS disponibiliza endpoints para a gestão completa da academia ATA, garantindo segurança, escalabilidade e integridade dos dados.")
  .setVersion("1.0")
  .addBearerAuth({
    type:"http",
    scheme:"bearer",
    bearerFormat:"JWT",
    name:"Authorization",
    in:"header",
  }, "accessToken")
  .build()
  
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api.ata-ruyus/v1/docs', app, document)
  
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    stopAtFirstError:true,
      exceptionFactory: (errors) => {
      for (const error of errors) {
        if (error.constraints) {
          const message = Object.values(error.constraints)[0];
          return new BadRequestException(message);
        }
      }
      return new BadRequestException('Dados inválidos');
  },
}));                                                            

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3002, '0.0.0.0');

  console.warn(`🚀 ATA-RUYUS API is runing on http://localhost:${process.env.PORT ?? 3002}/api.ata-ruyus/v1`);
  console.warn(`📚 You can access docs here => http://localhost:${process.env.PORT ?? 3002}/api.ata-ruyus/v1/docs`);
}
bootstrap();