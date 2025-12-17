import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { NoNeedToken } from 'src/custom-decorator/custom.decorator';

@Controller('user')
export class UserController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  @NoNeedToken()
  register(@Body() createUserDto: RegisterUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  @NoNeedToken()
  login(@Body() loginDto: LoginUserDto, @Req() req: Request) {
    console.log(req.user, 'cotroller');
    return this.authService.loginCallback(req, loginDto);
  }
}
