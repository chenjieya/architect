import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsNotEmpty({ message: 'id不能为空' })
  @Type(() => Number)
  id: number;
}
