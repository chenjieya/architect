import { Injectable } from '@nestjs/common';

@Injectable()
export class AopService {
  create() {
    return 'This action adds a new aop';
  }

  findAll() {
    return `This action returns all aop`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aop`;
  }

  update(id: number) {
    return `This action updates a #${id} aop`;
  }

  remove(id: number) {
    return `This action removes a #${id} aop`;
  }
}
