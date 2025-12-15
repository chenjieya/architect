import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { NoNeedPermission } from 'src/custom-decorator.decorator';

@Controller('user')
@NoNeedPermission()
export class UserController {
  @Inject(AuthService)
  private readonly authService: AuthService;
  constructor(private readonly userService: UserService) {}

  @Post('init')
  async init() {
    await this.userService.init();
    return '初始化成功';
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @NoNeedPermission()
  login(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    return this.authService.loginCallback(req, loginDto);
  }

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  async register(@Body() registerDto: LoginUserDto) {
    return await this.userService.register(registerDto);
  }

  @Get()
  getTest() {
    return true;
  }
}
