import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';


import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config_hosts } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Ft_transcendence_backend')
  .setDescription('Backend for ft_transcendence')
  .setVersion('1.0')
  .addBearerAuth()
  .addServer(`${config_hosts.backend_url}/api`)
  .build();

  
  const document = SwaggerModule.createDocument(app, config, {});
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    allowedHeaders: '*',
    origin: `${config_hosts.frontend_url}`,
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();