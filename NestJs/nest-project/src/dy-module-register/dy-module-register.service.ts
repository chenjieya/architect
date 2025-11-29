import { Injectable } from '@nestjs/common';
import { CreateDyModuleRegisterDto } from './dto/create-dy-module-register.dto';
import { UpdateDyModuleRegisterDto } from './dto/update-dy-module-register.dto';

@Injectable()
export class DyModuleRegisterService {
  create(createDyModuleRegisterDto: CreateDyModuleRegisterDto) {
    console.log(createDyModuleRegisterDto);
    return 'This action adds a new dyModuleRegister';
  }

  findAll() {
    return `This action returns all dyModuleRegister`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dyModuleRegister`;
  }

  update(id: number, updateDyModuleRegisterDto: UpdateDyModuleRegisterDto) {
    console.log(updateDyModuleRegisterDto);
    return `This action updates a #${id} dyModuleRegister`;
  }

  remove(id: number) {
    return `This action removes a #${id} dyModuleRegister`;
  }
}
