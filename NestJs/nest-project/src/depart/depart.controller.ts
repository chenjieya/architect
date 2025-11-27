import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartService } from './depart.service';
import { CreateDepartDto } from './dto/create-depart.dto';
import { UpdateDepartDto } from './dto/update-depart.dto';

@Controller('depart')
export class DepartController {
  constructor(private readonly departService: DepartService) {}

  @Post()
  create(@Body() createDepartDto: CreateDepartDto) {
    return this.departService.create(createDepartDto);
  }

  @Get()
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
  remove(@Param('id') id: string) {
    return this.departService.remove(+id);
  }
}
