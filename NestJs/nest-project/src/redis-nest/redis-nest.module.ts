import { Module } from '@nestjs/common';
import { RedisNestService } from './redis-nest.service';
import { RedisNestController } from './redis-nest.controller';
import { RedisModule } from 'src/redis.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';

@Module({
  imports: [RedisModule, TypeOrmModule.forFeature([ShoppingCart])],
  controllers: [RedisNestController],
  providers: [RedisNestService],
})
export class RedisNestModule {}
