import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployModule } from './employ/employ.module';
import { DepartModule } from './depart/depart.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { NoNeedPermissionGuard } from './custom-guard/no-need-permission.guard';

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
          username: configService.get('DB_NAME'),
          password: configService.get('DB_PWD'),
          database: configService.get('DB_DATABASE'),
          port: configService.get('DB_PORT'),
          host: configService.get('DB_HOST'),
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    EmployModule,
    DepartModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: NoNeedPermissionGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard('jwt'),
    // },
  ],
})
export class AppModule {}
