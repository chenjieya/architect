import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatHistory } from './entities/chat-history.entity';
import { Chatroom } from './entities/chatroom.entity';
import { FriendRequest } from './entities/friend-request.entity';
import { FriendShip } from './entities/friend-ship.entity';
import { UserChatroom } from './entities/user-chatroom.entity';
import { User } from './entities/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { MyAuthGuard } from './custom-guard/auth.guard';
import { ScanModule } from './scan/scan.module';
import { RedisModule } from './redis/redis.module';

const envFilePath = (() => {
  const env = process.env.NODE_ENV;
  if (!env) return '.env';

  switch (env) {
    case 'production':
      return ['.env.production', '.env'];
    case 'test':
      return ['.env.test', '.env'];
    case 'development':
      return ['.env.development', '.env'];
    default:
      return `.env.${env}`;
  }
})();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory(config: ConfigService) {
        return {
          type: 'mysql',
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
          database: config.get('DB_DATABASE'),
          username: config.get('DB_NAME'),
          password: config.get('DB_PWD'),
          entities: [
            ChatHistory,
            Chatroom,
            FriendRequest,
            FriendShip,
            UserChatroom,
            User,
          ],
          synchronize: config.get('DB_CREATE') === 'true',
        };
      },
    }),
    UserModule,
    AuthModule,
    ScanModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MyAuthGuard,
    },
  ],
})
export class AppModule {}
