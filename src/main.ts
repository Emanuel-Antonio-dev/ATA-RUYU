import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './Common/Filters/http-exception';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import logger  from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{logger: ['log', 'error', 'warn', 'debug', 'verbose']});

  // ✅ V-08 FIX: helmet/express-rate-limit/compression já constavam do
  // package.json mas nunca eram importados nem usados em lado nenhum —
  // sem `helmet`, faltavam X-Frame-Options/X-Content-Type-Options/HSTS/CSP
  // (que também mitigam parcialmente V-06); sem rate limiting, não havia
  // qualquer travão a força-bruta no login/OTP nem a scraping de V-01/V-02.
  app.use(helmet());
  app.use(compression());
  // limite global
  app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }));
  // limite mais apertado nas rotas de autenticação (login/OTP/reset de senha)
  app.use('/api.ata-ruyus/v1/auth', rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false }));

  app.use((cookieParser as any)());
  app.setGlobalPrefix('api.ata-ruyus/v1');

  // ✅ V-11 FIX: o Swagger ficava montado incondicionalmente, entregando a
  // qualquer visitante o mapa completo da API (rotas, DTOs, papéis) — o que
  // reduz drasticamente o esforço de reconhecimento para explorar V-01/
  // V-02/V-03. Só é montado fora de produção.
  if (process.env.NODE_ENV !== 'production') {
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
  }

  const uploadsPath = path.join(process.cwd(), 'uploads');
  // ✅ V-06 FIX (parte 4): `X-Content-Type-Options: nosniff` explícito nos
  // ficheiros estáticos — impede o browser de tentar adivinhar/"sniff" um
  // tipo diferente do declarado no Content-Type, mesmo que o `helmet()`
  // global já o aplique por omissão (defesa em profundidade).
  app.use('/uploads', express.static(uploadsPath, {
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  }));

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

  // ✅ V-10 FIX: `origin: true` reflecte de volta qualquer Origin recebida
  // — combinado com `credentials: true`, qualquer site na Internet
  // conseguiria fazer pedidos autenticados por cookie em nome de uma
  // sessão activa assim que existir autenticação por cookie (cookie-parser
  // já está instalado). Lista branca explícita via env var.
  const allowedOrigins = (process.env.CORS_ORIGINS ?? '').split(',').map(o => o.trim()).filter(Boolean);
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(process.env.PORT ?? 3002, '0.0.0.0');

  console.warn(`🚀 ATA-RUYUS API is runing on http://localhost:${process.env.PORT ?? 3002}/api.ata-ruyus/v1`);
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`📚 You can access docs here => http://localhost:${process.env.PORT ?? 3002}/api.ata-ruyus/v1/docs`);
  }
}
bootstrap();