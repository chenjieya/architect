import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTypeOrmNestDto } from './dto/create-type-orm-nest.dto';
import { UpdateTypeOrmNestDto } from './dto/update-type-orm-nest.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TypeOrmNest } from './entities/type-orm-nest.entity';

@Injectable()
export class TypeOrmNestService {
  @InjectEntityManager()
  private readonly manager: EntityManager;

  // @InjectRepository(TypeOrmNest)
  // private readonly respository: Repository<TypeOrmNest>;

  async findUserById(id: number) {
    return this.manager.findOne(TypeOrmNest, {
      where: {
        id,
      },
    });
  }

  async create(createTypeOrmNestDto: CreateTypeOrmNestDto) {
    // 创建一个User用户
    // 查询数据库，是否存在该用户
    const allUser = await this.findAll(
      createTypeOrmNestDto.name,
      createTypeOrmNestDto.age,
    );

    if (allUser.length) {
      throw new BadRequestException('用户已经存在');
    }

    return this.manager.save(TypeOrmNest, createTypeOrmNestDto);
  }

  async findAll(name?: string, age?: number) {
    console.log('查询参数:', { name, age });

    // 创建查询构建器
    const queryBuilder = this.manager
      .createQueryBuilder(TypeOrmNest, 'entity')
      .select('entity'); // 明确选择

    // 打印原始SQL
    const sql = queryBuilder.getSql();
    console.log('原始SQL:', sql);

    // 动态添加条件
    if (name !== undefined && name !== null) {
      console.log('添加name条件:', name);
      queryBuilder.andWhere('entity.name = :name', { name });
    }

    if (age !== undefined && age !== null) {
      console.log('添加age条件:', age);
      queryBuilder.andWhere('entity.age = :age', { age });
    }

    // 打印最终SQL
    const finalSql = queryBuilder.getSql();
    const parameters = queryBuilder.getParameters();
    console.log('最终SQL:', finalSql);
    console.log('参数:', parameters);

    try {
      const result = await queryBuilder.getMany();
      console.log('查询结果数量:', result.length);
      console.log('查询结果:', result);
      return result;
    } catch (error) {
      console.error('查询错误:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    return await this.findUserById(id);
  }

  async update(id: number, updateTypeOrmNestDto: UpdateTypeOrmNestDto) {
    const user = await this.findUserById(id);

    if (!user) {
      throw new BadRequestException('当前用户不存在');
    }

    return await this.manager.save(TypeOrmNest, {
      ...updateTypeOrmNestDto,
      id,
    });
  }

  async remove(id: number) {
    return await this.manager.delete(TypeOrmNest, id);
  }
}
