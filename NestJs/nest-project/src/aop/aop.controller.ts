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
  UsePipes,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AopService } from './aop.service';
import { AopGuard } from './aop.guard';
import { TimeoutInterceptor } from 'src/timeout.interceptor';
import { ValidatePipe } from 'src/validate.pipe';

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

  // 使用自定义的管道
  // @Delete(':id')
  // remove(@Param('id', ValidatePipe) id: string) {
  //   return this.aopService.remove(+id);
  // }

  // 使用官方提供的管道ParseIntPipe必须是数字类型的字符串
  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   console.log(id, typeof id, 'id');
  //   return this.aopService.remove(id);
  // }

  @Delete(':id')
  remove(
    @Param(
      'id',
      new ParseIntPipe({
        exceptionFactory() {
          const obj = {
            statusCode: HttpStatus.NOT_ACCEPTABLE,
            message: '参数必须是数字类型的字符串',
            error: 'Not Acceptable',
            success: false,
          };
          throw new HttpException(obj, HttpStatus.NOT_ACCEPTABLE);
        },
      }),
    )
    id: number,
  ) {
    console.log(id, typeof id, 'id');
    return this.aopService.remove(id);
  }
}
