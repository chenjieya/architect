import { PartialType } from '@nestjs/mapped-types';
import { CreateDyModuleRegisterDto } from './create-dy-module-register.dto';

export class UpdateDyModuleRegisterDto extends PartialType(CreateDyModuleRegisterDto) {}
