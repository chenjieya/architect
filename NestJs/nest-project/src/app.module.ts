import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { DepartModule } from './depart/depart.module';
import { DyModuleRegisterModule } from './dy-module-register/dy-module-register.module';
import { AopModule } from './aop/aop.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { GlobalGuardGuard } from './global-guard.guard';
import { TimeoutInterceptor } from './timeout.interceptor';
import { ValidatePipe } from './validate.pipe';
import { UploadFileModule } from './upload-file/upload-file.module';
import { TypeOrmNestModule } from './type-orm-nest/type-orm-nest.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmNest } from './type-orm-nest/entities/type-orm-nest.entity';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { RedisModule } from './redis.module';
import { RedisNestModule } from './redis-nest/redis-nest.module';
import { SessionNestModule } from './session-nest/session-nest.module';
import { LoginJwtModule } from './login-jwt/login-jwt.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MinioModule } from './minio/minio.module';
import { LoggerModule } from './logger/logger.module';
import { NextFunction, Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerFilter } from './logger.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          timezone: 'Z',
          database: configService.get('DB_DATABASE'),
          username: configService.get('DB_NAME'),
          password: configService.get('DB_PWD'),
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'alvis.org.cn',
    //   port: 3306,
    //   timezone: 'Z',
    //   database: 'nest-typeorm',
    //   username: 'root',
    //   password: 'xiaozhai',
    //   synchronize: true,
    //   autoLoadEntities: true,
    //   // nest11中，放弃了这种通配符路径的方式，推荐上面的方式 + forFeature
    //   // entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   // entities: [TypeOrmNest],
    // }),
    UserModule,
    PersonModule,
    DepartModule,
    DyModuleRegisterModule.register({
      option1: 'value1',
      option2: 'value2',
    }),
    AopModule,
    UploadFileModule,
    TypeOrmNestModule,
    RedisModule,
    RedisNestModule,
    SessionNestModule,
    LoginJwtModule,
    AuthModule,
    MinioModule,
    LoggerModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },

    // 注册成全局管道
    // {
    //   provide: APP_PIPE,
    //   useClass: ValidatePipe,
    // },

    {
      provide: APP_FILTER,
      useClass: LoggerFilter,
    },
  ],
})
export class AppModule implements NestModule {
  // constructor(private dataSource: DataSource) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
