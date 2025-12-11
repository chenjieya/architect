import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { Repository } from 'typeorm';
import type { RedisClientType } from 'redis';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Injectable()
export class RedisNestService {
  @InjectRepository(ShoppingCart)
  private readonly shopRepostity: Repository<ShoppingCart>;

  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  async create(createShopping: CreateShoppingCartDto) {
    // 保存到sql数据库
    await this.shopRepostity.save(createShopping);

    // 保存到redis中
    await this.redisClient.set(
      `cart:${createShopping.userId}`,
      JSON.stringify(createShopping.carData),
      {
        expiration: {
          type: 'EX',
          // 60秒缓存过期
          value: 60,
        },
      },
    );

    return {
      message: '添加购物车成功',
      success: true,
    };
  }

  async findOneByUserId(
    id: number,
  ): Promise<Record<string, number> | undefined> {
    // 先从缓存中查找
    const catchData = await this.redisClient.get(`cart:${id}`);

    const cart = catchData ? JSON.parse(catchData) : undefined;

    if (cart) {
      return cart;
    }

    // 缓存中没有从数据库中查找
    const sqlRes = await this.shopRepostity.findOne({
      where: {
        userId: id,
      },
    });
    return sqlRes?.carData;
  }

  async update(updateDto: UpdateShoppingCartDto) {
    const {
      userId,
      carData: { count = 1 },
    } = updateDto;

    const res = await this.findOneByUserId(userId);

    if (!res) {
      throw new BadRequestException('没有找到对应的用户购物车');
    }

    res.count += count;

    // 更新数据库
    await this.shopRepostity.save(res);

    // 更新缓存
    await this.redisClient.set(`cart:${userId}`, JSON.stringify(res));

    return {
      success: true,
      message: '成功更新购物车',
    };
  }
}
