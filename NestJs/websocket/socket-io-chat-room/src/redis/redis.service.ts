import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClien: RedisClientType,
  ) {}

  async set(key: string, value: any, ttl: number = 60): Promise<void> {
    await this.redisClien.set(key, JSON.stringify(value));
    if (ttl) {
      await this.redisClien.expire(key, ttl);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClien.get(key);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? JSON.parse(data) : null;
  }
}
