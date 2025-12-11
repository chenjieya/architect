import { Module } from '@nestjs/common';
import { createClient } from 'redis';

function createRedis() {
  return createClient({
    socket: {
      host: 'alvis.org.cn',
      port: 6379,
    },
  }).connect();
}

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: createRedis,
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
