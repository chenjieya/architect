import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerMiddleware } from './logger.middleware';
import { AopGuard } from './aop/aop.guard';
import { ValidationPipe } from '@nestjs/common';

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      // 相当于总开关，如果下面未配置，则默认是严格模式。需要使用@Type进行类型转换
      transform: true,
      transformOptions: {
        // 总开关下的细节配置，总开关没开的情况，全都失效
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
