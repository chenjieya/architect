import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployService } from './employ.service';
import { CreateEmployDto } from './dto/create-employ.dto';
import { UpdateEmployDto } from './dto/update-employ.dto';

@Controller('employ')
export class EmployController {
  constructor(private readonly employService: EmployService) {}

  @Post()
  create(@Body() createEmployDto: CreateEmployDto) {
    return this.employService.create(createEmployDto);
  }

  @Get()
  findAll() {
    return this.employService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmployDto: UpdateEmployDto) {
    return this.employService.update(+id, updateEmployDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employService.remove(+id);
  }
}
