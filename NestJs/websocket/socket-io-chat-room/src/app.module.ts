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
import { FriendShipModule } from './friend-ship/friend-ship.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { MinioModule } from './minio/minio.module';
import { ChatModule } from './chat/chat.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
          timezone: 'local',
          entities: [
            ChatHistory,
            Chatroom,
            FriendRequest,
            FriendShip,
            UserChatroom,
            User,
          ],
          logger: 'simple-console',
          synchronize: config.get('DB_CREATE') === 'true',
          extra: {
            connectionLimit: 10, // 最大连接数
            connectTimeout: 10000, // 连接超时时间（毫秒）
            // acquireTimeout: 10000, // 获取连接超时时间
            waitForConnections: true, // 等待连接
            queueLimit: 0,
            enableKeepAlive: true, // 启用 keep-alive
            keepAliveInitialDelay: 0, // keep-alive 初始延迟
          },
          // 其他优化配置
          poolSize: 10, // 连接池大小
          connectorPackage: 'mysql2', // 使用 mysql2 驱动（已使用）
          retryAttempts: 3, // 重试次数
          retryDelay: 3000, // 重试延迟（毫秒）
        };
      },
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ScanModule,
    RedisModule,
    FriendShipModule,
    ChatroomModule,
    MinioModule,
    ChatModule,
    ChatHistoryModule,
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
