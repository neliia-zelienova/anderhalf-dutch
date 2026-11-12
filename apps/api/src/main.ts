import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cookies: {
      secret: process.env.COOKIE_SECRET,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
