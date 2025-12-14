import { Module } from '@nestjs/common';
import { DepartService } from './depart.service';
import { DepartController } from './depart.controller';

@Module({
  controllers: [DepartController],
  providers: [DepartService],
})
export class DepartModule {}
