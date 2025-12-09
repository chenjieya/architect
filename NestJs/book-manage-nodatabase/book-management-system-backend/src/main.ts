import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.useGlobalPipes(new ValidationPipe());

  // 将存储图片的uploads文件夹设置为静态服务
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // 跨域处理
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
