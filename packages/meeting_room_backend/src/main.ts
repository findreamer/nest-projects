import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FormatResponseInterceptor,
  InvokeRecordInterceptor,
} from '@/common/interceptor';
import { UnloginFilter } from './common/filter/unlogin.filter';
import { CustomExceptionFilter } from './common/filter/custom-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new FormatResponseInterceptor());

  if (process.env.NODE_ENV === 'development') {
    app.useGlobalInterceptors(new InvokeRecordInterceptor());
  }

  app.useGlobalFilters(new UnloginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });

  const configService = app.get(ConfigService);

  const documentConfig = new DocumentBuilder()
    .setTitle('会议室预订系统')
    .setDescription('会议室预订系统接口文档')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      name: 'Authorization',
      description: 'Bearer token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('api-doc', app, document);
  await app.listen(configService.get('nest_server_port') ?? 3000);
}
bootstrap();
