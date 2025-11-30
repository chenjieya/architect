import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerMiddleware } from './logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('public', { prefix: '/static' });
  // 全局使用中间件
  const logger = new LoggerMiddleware();
  app.use(logger.use.bind(logger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
