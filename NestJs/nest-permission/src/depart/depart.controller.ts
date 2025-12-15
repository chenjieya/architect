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
import { DepartService } from './depart.service';
import { CreateDepartDto } from './dto/create-depart.dto';
import { UpdateDepartDto } from './dto/update-depart.dto';
import { PermissionRequired } from 'src/custom-decorator.decorator';

@Controller('depart')
export class DepartController {
  constructor(private readonly departService: DepartService) {}

  @Post()
  @PermissionRequired('新增 部门')
  create(@Body() createDepartDto: CreateDepartDto) {
    return this.departService.create(createDepartDto);
  }

  @Get()
  @PermissionRequired('查询 部门')
  findAll() {
    return this.departService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepartDto: UpdateDepartDto) {
    return this.departService.update(+id, updateDepartDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.departService.remove(+id);
  }
}
