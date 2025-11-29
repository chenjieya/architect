import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DyModuleRegisterService } from './dy-module-register.service';
import { CreateDyModuleRegisterDto } from './dto/create-dy-module-register.dto';
import { UpdateDyModuleRegisterDto } from './dto/update-dy-module-register.dto';

@Controller('dy-module-register')
export class DyModuleRegisterController {
  constructor(
    private readonly dyModuleRegisterService: DyModuleRegisterService,
  ) {}

  @Post()
  create(@Body() createDyModuleRegisterDto: CreateDyModuleRegisterDto) {
    return this.dyModuleRegisterService.create(createDyModuleRegisterDto);
  }

  @Get()
  findAll() {
    return this.dyModuleRegisterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dyModuleRegisterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDyModuleRegisterDto: UpdateDyModuleRegisterDto,
  ) {
    return this.dyModuleRegisterService.update(+id, updateDyModuleRegisterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dyModuleRegisterService.remove(+id);
  }
}
