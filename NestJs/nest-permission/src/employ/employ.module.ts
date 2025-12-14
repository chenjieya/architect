import { Module } from '@nestjs/common';
import { EmployService } from './employ.service';
import { EmployController } from './employ.controller';

@Module({
  controllers: [EmployController],
  providers: [EmployService],
})
export class EmployModule {}
