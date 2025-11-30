import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
// import { AopModule } from 'src/aop/aop.module';

// 变成全局模块
@Global()
@Module({
  // imports: [AopModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
