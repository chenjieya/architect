import { PartialType } from '@nestjs/mapped-types';
import { CreateAopDto } from './create-aop.dto';

export class UpdateAopDto extends PartialType(CreateAopDto) {}
