import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AopService } from './aop.service';

@Controller('aop')
export class AopController {
  constructor(private readonly aopService: AopService) {}

  @Post()
  create() {
    return this.aopService.create();
  }

  @Get()
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
