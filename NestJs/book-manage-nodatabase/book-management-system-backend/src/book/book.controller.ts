import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post('create')
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get('list')
  findAll(@Query('name') name?: string) {
    return this.bookService.findAll(name);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.bookService.remove(+id);
  }

  @Put('update')
  update(@Body() updateBook: UpdateBookDto) {
    return this.bookService.update(updateBook);
  }
}
