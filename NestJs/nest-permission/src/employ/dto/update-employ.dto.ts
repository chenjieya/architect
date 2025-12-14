import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployDto } from './create-employ.dto';

export class UpdateEmployDto extends PartialType(CreateEmployDto) {}
