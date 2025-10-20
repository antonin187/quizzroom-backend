import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000', // ton front Next.js
      'https://ton-domaine.fr', // (optionnel) ton domaine de prod
    ],
    credentials: true, // ✅ indispensable pour autoriser les cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
