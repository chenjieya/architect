import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

function createRedis(config: ConfigService) {
  return createClient({
    socket: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
  }).connect();
}

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: createRedis,
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
