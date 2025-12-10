import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TypeOrmNestService } from './type-orm-nest.service';
import { CreateTypeOrmNestDto } from './dto/create-type-orm-nest.dto';
import { UpdateTypeOrmNestDto } from './dto/update-type-orm-nest.dto';

@Controller('type-orm-nest')
export class TypeOrmNestController {
  constructor(private readonly typeOrmNestService: TypeOrmNestService) {}

  @Post()
  create(@Body() createTypeOrmNestDto: CreateTypeOrmNestDto) {
    return this.typeOrmNestService.create(createTypeOrmNestDto);
  }

  @Get()
  findAll(@Query('name') name?: string, @Query('age') age?: number) {
    return this.typeOrmNestService.findAll(name, age);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    console.log(typeof id, 'id');
    return this.typeOrmNestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateTypeOrmNestDto: UpdateTypeOrmNestDto,
  ) {
    return this.typeOrmNestService.update(+id, updateTypeOrmNestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.typeOrmNestService.remove(+id);
  }
}
