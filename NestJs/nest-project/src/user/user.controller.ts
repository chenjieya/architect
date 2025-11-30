import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
// import { AopGuard } from 'src/aop/aop.guard';
import { GlobalGuardGuard } from 'src/global-guard.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  // @UseGuards(AopGuard)
  @UseGuards(GlobalGuardGuard)
  getUser(): string {
    return 'Hello User!';
  }

  @Post()
  postUser(): string {
    return this.userService.getUser();
  }
}
