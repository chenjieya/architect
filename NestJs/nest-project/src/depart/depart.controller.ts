import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DepartService } from './depart.service';
import { CreateDepartDto } from './dto/create-depart.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('depart')
export class DepartController {
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
}
