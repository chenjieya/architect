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
  Get,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { NoNeedToken, UserInfo } from 'src/custom-decorator/custom.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

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
    return this.authService.loginCallback(req, loginDto);
  }

  @Get('info')
  @UseInterceptors(ClassSerializerInterceptor)
  async getInfo(@UserInfo('id') id: string) {
    const user = await this.userService.findUserById(+id);
    return user;
  }

  @Put('update-info')
  @UseInterceptors(ClassSerializerInterceptor)
  async updateUser(@Body() updateUser: UpdateUserDto) {
    return await this.userService.updateUser(updateUser);
  }
}
