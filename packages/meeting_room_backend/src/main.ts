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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const configService = app.get(ConfigService);
  await app.listen(configService.get('nest_server_port') ?? 3000);
}
bootstrap();
