import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AopService } from './aop.service';
import { AopController } from './aop.controller';
import { AopMiddleware } from './aop.middleware';

@Module({
  controllers: [AopController],
  providers: [AopService],
  // exports: [AopService],
})
export class AopModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 中间件，在aop模块中注册
    // forRoutes(AopController) 表示只对AopController生效
    // consumer.apply(AopMiddleware).forRoutes(AopController);

    // 也可以手动指定路径和请求方法
    consumer.apply(AopMiddleware).forRoutes({
      path: '/aop',
      method: RequestMethod.GET,
    });
  }
}
