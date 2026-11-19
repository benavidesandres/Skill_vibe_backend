import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix for API endpoints
  app.setGlobalPrefix('api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Aplica @Exclude() de class-transformer (ej. oculta el password en las respuestas)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Enable CORS
  app.enableCors();

  // Documentación Swagger en /api/docs (JSON en /api/docs-json)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SkillVibes API')
    .setDescription(
      'Marketplace de tutorías: usuarios, ofertas (skills), reservas y reseñas. ' +
        'Para las rutas protegidas haz login, copia el accessToken y pégalo en "Authorize".',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 SkillVibes Backend is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
}

bootstrap();
