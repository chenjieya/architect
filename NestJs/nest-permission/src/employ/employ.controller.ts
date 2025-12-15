import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EmployService } from './employ.service';
import { CreateEmployDto } from './dto/create-employ.dto';
import { UpdateEmployDto } from './dto/update-employ.dto';
import { PermissionRequired } from 'src/custom-decorator.decorator';

@Controller('employ')
export class EmployController {
  constructor(private readonly employService: EmployService) {}

  @Post()
  @PermissionRequired('新增 员工')
  create(@Body() createEmployDto: CreateEmployDto) {
    return this.employService.create(createEmployDto);
  }

  @Get()
  @PermissionRequired('查询 员工')
  findAll() {
    return this.employService.findAll();
  }

  @Get(':id')
  @PermissionRequired('查询 员工')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employService.findOne(id);
  }

  @Patch(':id')
  @PermissionRequired('更新 员工')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployDto: UpdateEmployDto,
  ) {
    return this.employService.update(id, updateEmployDto);
  }

  @Delete(':id')
  @PermissionRequired('删除 员工')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employService.remove(id);
  }
}
