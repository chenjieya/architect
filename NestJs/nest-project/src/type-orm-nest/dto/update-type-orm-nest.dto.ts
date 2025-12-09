import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeOrmNestDto } from './create-type-orm-nest.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateTypeOrmNestDto extends PartialType(CreateTypeOrmNestDto) {
  @IsNotEmpty()
  id: number;
}
