import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RedisNestService } from './redis-nest.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Controller('redis-nest')
export class RedisNestController {
  constructor(private readonly redisNestService: RedisNestService) {}

  @Post()
  create(@Body() createCart: CreateShoppingCartDto) {
    return this.redisNestService.create(createCart);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.redisNestService.findOneByUserId(id);
  }

  @Patch()
  update(@Body() updateDto: UpdateShoppingCartDto) {
    return this.redisNestService.update(updateDto);
  }
}
