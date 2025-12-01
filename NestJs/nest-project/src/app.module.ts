import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { DepartModule } from './depart/depart.module';
import { DyModuleRegisterModule } from './dy-module-register/dy-module-register.module';
import { AopModule } from './aop/aop.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GlobalGuardGuard } from './global-guard.guard';
import { TimeoutInterceptor } from './timeout.interceptor';
import { ValidatePipe } from './validate.pipe';

@Module({
  imports: [
    UserModule,
    PersonModule,
    DepartModule,
    DyModuleRegisterModule.register({
      option1: 'value1',
      option2: 'value2',
    }),
    AopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'car',
      useValue: {
        name: 'BMW',
        price: 5000,
      },
    },
    {
      provide: 'random',
      useFactory: (
        car: { name: string; price: number },
        appService: AppService,
      ) => {
        return {
          random: Math.random(),
          car: car,
          say: appService.getHello(),
        };
      },
      inject: ['car', AppService],
    },
    // 注册成全局守卫
    {
      provide: APP_GUARD,
      useClass: GlobalGuardGuard,
    },
    // 注册成全局拦截器
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: TimeoutInterceptor,
    // },

    // 注册成全局管道
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidatePipe,
    // },
  ],
})
export class AppModule {}
