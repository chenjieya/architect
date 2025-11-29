import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  Ip,
  Headers,
  Req,
  Res,
  Inject,
} from '@nestjs/common';
import { CreateDepartDto } from './dto/create-depart.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('depart')
export class DepartController {
  // 测试全局注册的模块
  @Inject()
  private readonly userService: UserService;

  @Get()
  getTest() {
    return this.userService.getUser();
  }

  @Post('formUrlEncoded')
  formUrlEncoded(@Body() createDepartDto: CreateDepartDto) {
    return `received: ${JSON.stringify(createDepartDto)}; age类型: ${typeof createDepartDto.age}`;
  }

  @Get('queryParam')
  queryParam(@Query('name') name: string, @Query('age') age: string) {
    return `received name: ${name}, age: ${age}, age类型:${typeof age}`;
  }

  @Get('urlParam/:id')
  urlParam(@Param('id') id: string) {
    return `received id: ${id}`;
  }

  @Post('file')
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads/',
    }),
  )
  getFile(
    @Body() createDepartDto: CreateDepartDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(files);
    return `received: ${JSON.stringify(createDepartDto)}`;
  }

  @Get('other')
  other(
    @Ip() ip: string,
    @Headers() headers: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    console.log(ip);
    console.log(headers);
    // console.log(headerType);
    console.log(req);

    // 注意： 如果定义了res响应体，就必须使用自己定义的响应体去做返回的信息处理
    console.log(res);
    res.send('other');
    // return 'other';
  }
}
