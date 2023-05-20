import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { text } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(text({ type: 'text/xml' }));
  const port = app.get(ConfigService).get('PORT');
  await app.listen(port);
}

bootstrap();
