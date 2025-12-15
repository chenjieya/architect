import { Injectable } from '@nestjs/common';
import { CreateEmployDto } from './dto/create-employ.dto';
import { UpdateEmployDto } from './dto/update-employ.dto';

@Injectable()
export class EmployService {
  create(createEmployDto: CreateEmployDto) {
    return 'This action adds a new employ';
  }

  findAll() {
    return `This action returns all employ`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employ`;
  }

  update(id: number, updateEmployDto: UpdateEmployDto) {
    return `This action updates a #${id} employ`;
  }

  remove(id: number) {
    return `This action removes a #${id} employ ${typeof id}`;
  }
}
