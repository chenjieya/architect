import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerMiddleware } from './logger.middleware';
import { AopGuard } from './aop/aop.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('public', { prefix: '/static' });
  // 全局使用中间件
  const logger = new LoggerMiddleware();
  app.use(logger.use.bind(logger));
  // 使用全局的守卫
  // 该方法是失败的，因为nest是全局的container来管理对象的，如果在此处new一个对象，会导致无法使用依赖注入
  // app.useGlobalGuards(new AopGuard());
  // 全局守卫的注册方式请查看app.module.ts中的相关配置
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
