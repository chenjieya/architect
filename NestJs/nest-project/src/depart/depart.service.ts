import { Injectable } from '@nestjs/common';
import { CreateDepartDto } from './dto/create-depart.dto';
import { UpdateDepartDto } from './dto/update-depart.dto';

@Injectable()
export class DepartService {
  create(createDepartDto: CreateDepartDto) {
    return 'This action adds a new depart';
  }

  findAll() {
    return `This action returns all depart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} depart`;
  }

  update(id: number, updateDepartDto: UpdateDepartDto) {
    return `This action updates a #${id} depart`;
  }

  remove(id: number) {
    return `This action removes a #${id} depart`;
  }
}
