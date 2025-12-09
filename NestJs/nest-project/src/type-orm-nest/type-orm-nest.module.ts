import { Module } from '@nestjs/common';
import { TypeOrmNestService } from './type-orm-nest.service';
import { TypeOrmNestController } from './type-orm-nest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmNest } from './entities/type-orm-nest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmNest])],
  controllers: [TypeOrmNestController],
  providers: [TypeOrmNestService],
})
export class TypeOrmNestModule {}
