import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AopService } from './aop.service';
import { AopGuard } from './aop.guard';
import { TimeoutInterceptor } from 'src/timeout.interceptor';

@Controller('aop')
// 在类上使用，作用于全部接口
// @UseGuards(AopGuard)
export class AopController {
  constructor(private readonly aopService: AopService) {}

  @Post()
  @UseInterceptors(TimeoutInterceptor)
  create() {
    console.log('controller 层方法执行');
    return this.aopService.create();
  }

  @Get()
  @UseGuards(AopGuard)
  findAll() {
    console.log('contorller 层方法执行');
    return this.aopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aopService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.aopService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aopService.remove(+id);
  }
}
