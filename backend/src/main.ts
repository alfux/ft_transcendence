import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Ft_transcendence_backend')
  .setDescription('Backend for ft_transcendence')
  .setVersion('1.0')
  .addBearerAuth()
  .addServer('http://localhost:3001/api')
  .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);


  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    allowedHeaders: '*',
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();